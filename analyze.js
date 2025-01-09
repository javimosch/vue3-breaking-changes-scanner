#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Groq = require('groq-sdk');

const groq = new Groq();

async function analyzeWithGroq(content) {

  // Check for GROQ_API_KEY
if (!process.env.GROQ_API_KEY) {
  console.error(chalk.red('Error: GROQ_API_KEY environment variable is not set'));
  process.exit(1);
}

  const prompt = `You are a Vue.js migration assistant. Analyze the following Vue.js component for migration from Vue 2 to Vue 3.
  You must respond with ONLY a JSON array of objects, with no additional text or explanation.
  Each object in the array must follow this exact structure:
  {
    "issue": "string describing the issue",
    "severity": "high|medium|low",
    "location": "string describing where in the code this occurs",
    "before": "string showing current code",
    "after": "string showing migrated code",
    "explanation": "string explaining the change needed"
  }

  If no issues are found, respond with an empty array: []

  Vue Component to analyze:
  \`\`\`vue
  ${content}
  \`\`\``;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a Vue migration assistant that only responds with valid JSON arrays containing migration suggestions. Never include any explanatory text outside the JSON structure."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
      stop: null
    });

    const response = chatCompletion.choices[0].message.content.trim();
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error(chalk.yellow('Warning: Invalid JSON response from Groq. Attempting to fix...'));
      
      // Try to extract JSON array if it's wrapped in text
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Could not parse Groq response as JSON');
    }
  } catch (error) {
    console.error(chalk.red('Error analyzing with Groq:', error.message));
    if (error.response?.data) {
      console.error(chalk.red('API Error details:', JSON.stringify(error.response.data, null, 2)));
    }
    return [];
  }
}

async function analyzeFile(filePath) {
  console.log(chalk.blue('Invoking analyzeFile for:', filePath));
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(chalk.blue('\nAnalyzing file:', filePath));
    console.log(chalk.yellow('='.repeat(50)));
    console.log(chalk.white('Analyzing with Groq AI...'));

    const findings = await analyzeWithGroq(content);

    if (findings.length === 0) {
      console.log(chalk.green('✓ No migration changes detected!'));
      return;
    }

    console.log(chalk.red(`\nFound ${findings.length} potential migration items:\n`));

    findings.forEach((finding, index) => {
      console.log(chalk.yellow(`${index + 1}. ${finding.issue}`));
      console.log(chalk.white(`Severity: ${finding.severity}`));
      console.log(chalk.white(`Location: ${finding.location}`));
      console.log('\nBefore:');
      console.log(chalk.red(finding.before));
      console.log('\nAfter:');
      console.log(chalk.green(finding.after));
      console.log('\nExplanation:');
      console.log(chalk.white(finding.explanation));
      console.log(chalk.yellow('-'.repeat(50)));
    });

  } catch (error) {
    console.error(chalk.red('Error analyzing file:', error.message));
    process.exit(1);
  }
}


/* 
program
  .version('1.0.0')
  .requiredOption('-f, --file <path>', 'Vue SFC file to analyze')
  .parse(process.argv);

const options = program.opts();

if (!fs.existsSync(options.file)) {
  console.error(chalk.red('Error: File does not exist:', options.file));
  process.exit(1);
}

if (!options.file.endsWith('.vue')) {
  console.error(chalk.red('Error: File must be a .vue component'));
  process.exit(1);
}

analyzeFile(options.file); */

module.exports = { analyzeFile };
