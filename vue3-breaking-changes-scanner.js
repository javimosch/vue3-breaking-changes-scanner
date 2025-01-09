#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const glob = require('glob');
const chalk = require('chalk');

// Breaking changes patterns to scan for
const breakingChanges = {
    '1. Global API Changes (1)': {
        patterns: [
            /Vue\.extend/,
            /Vue\.nextTick/,
            /Vue\.set/,
            /Vue\.delete/,
            /Vue\.directive/,
            /Vue\.filter/,
            /Vue\.component/,
            /Vue\.use/,
            /Vue\.mixin/
        ]
    },
    '2. v-model Behavior (2)': {
        patterns: [
            /v-bind:value/,
            /v-bind\.sync/,
            /@input/,
            /\$emit\(['"]input['"]/
        ]
    },
    '3. Key Modifiers (3)': {
        patterns: [
            /v-on:keyup\.\d+/,
            /v-on:keydown\.\d+/,
            /@keyup\.\d+/,
            /@keydown\.\d+/
        ]
    },
    '4. Event Bus (4)': {
        patterns: [
            /\$on\(/,
            /\$off\(/,
            /\$once\(/,
            /new Vue\(\).*(?:\$emit|\$on|\$off|\$once)/s
        ]
    },
    '5. Filters (5)': {
        patterns: [
            /\|\s*[a-zA-Z]/,
            /Vue\.filter\(/,
            /filters:\s*{/
        ]
    },
    '6. Scoped Slots (6)': {
        patterns: [
            /slot=/,
            /slot-scope=/,
            /v-slot:/
        ]
    },
    '7. Lifecycle Hooks (7)': {
        patterns: [
            /beforeDestroy/,
            /destroyed/
        ]
    },
    '8. Vue.set and Vue.delete (8)': {
        patterns: [
            /Vue\.set\(/,
            /Vue\.delete\(/,
            /\$set\(/,
            /\$delete\(/
        ]
    },
    '9. Webpack Config (9)': {
        patterns: [
            /vue\.config\.js/,
            /webpack\.config\.js/,
            /chainWebpack/,
            /configureWebpack/
        ]
    },
    '10. Plugin Usage (10)': {
        patterns: [
            /Vue\.use\(/
        ]
    },
    '11. Router/Vuex (11)': {
        patterns: [
            /new Router\(/,
            /new Vuex\.Store\(/,
            /Vue\.prototype\.\$router/,
            /Vue\.prototype\.\$store/
        ]
    }
};

// Function to calculate file complexity
function calculateFileComplexity(fileIssues, weights) {
    let score = 0;
    fileIssues.forEach(change => {
        const changeType = change.split('. ')[1];
        score += weights[changeType] || 1;
    });
    return score;
}

// Function to calculate module complexity
function calculateModuleComplexity(moduleStats) {
    const weights = {
        'Global API Changes': 2,
        'v-model Behavior': 2,
        'Key Modifiers': 1,
        'Event Bus': 2,
        'Filters': 1,
        'Scoped Slots': 1,
        'Lifecycle Hooks': 1,
        'Vue.set and Vue.delete': 1,
        'Webpack Config': 3,
        'Plugin Usage': 2,
        'Router/Vuex': 2
    };

    let filesComplexity = {
        Low: 0,
        Medium: 0,
        High: 0,
        total: 0
    };

    // Create a map of files and their issues
    let fileIssuesMap = new Map();
    
    Object.entries(moduleStats.issuesByChange).forEach(([change, { files }]) => {
        files.forEach(file => {
            if (!fileIssuesMap.has(file)) {
                fileIssuesMap.set(file, []);
            }
            fileIssuesMap.get(file).push(change);
        });
    });

    // Calculate complexity for each file
    fileIssuesMap.forEach((issues, file) => {
        const score = calculateFileComplexity(issues, weights);
        
        if (score <= 2) filesComplexity.Low++;
        else if (score <= 4) filesComplexity.Medium++;
        else filesComplexity.High++;
        
        filesComplexity.total++;
    });

    // Calculate percentages
    return {
        Low: filesComplexity.total > 0 ? Math.round((filesComplexity.Low / filesComplexity.total) * 100) : 0,
        Medium: filesComplexity.total > 0 ? Math.round((filesComplexity.Medium / filesComplexity.total) * 100) : 0,
        High: filesComplexity.total > 0 ? Math.round((filesComplexity.High / filesComplexity.total) * 100) : 0,
        hasHigh: filesComplexity.High > 0
    };
}

// Function to scan a single file
function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues = {};

    Object.entries(breakingChanges).forEach(([change, { patterns }]) => {
        const matchingPatterns = patterns.some(pattern => pattern.test(content));
        if (matchingPatterns) {
            if (!issues[change]) {
                issues[change] = [];
            }
            issues[change].push(filePath);
        }
    });

    return {
        issues,
        complexity: calculateFileComplexity(Object.keys(issues), {
            'Global API Changes': 2,
            'v-model Behavior': 2,
            'Key Modifiers': 1,
            'Event Bus': 2,
            'Filters': 1,
            'Scoped Slots': 1,
            'Lifecycle Hooks': 1,
            'Vue.set and Vue.delete': 1,
            'Webpack Config': 3,
            'Plugin Usage': 2,
            'Router/Vuex': 2
        })
    };
}

// Function to get module name from file path
function getModuleName(filePath) {
    const componentsMatch = filePath.match(/src\/components\/([^/]+)/);
    if (componentsMatch) {
        return componentsMatch[1];
    }
    return 'non-module';
}

// Function to scan directory recursively
async function scanDirectory(directory, showDetails = false, whitelist) {
    const stats = {
        totalFiles: 0,
        issuesByChange: {},
        moduleStats: {
            'non-module': {
                totalFiles: 0,
                issuesByChange: {},
                complexity: { Low: 0, Medium: 0, High: 0 }
            }
        }
    };

    // Get all relevant files
    const files = glob.sync(path.join(directory, '**/*.{vue,js}'), {
        ignore: ['**/node_modules/**', '**/dist/**']
    }).filter(file => {
        // If whitelist is provided, only include files in the specified sub-folders
        if (whitelist) {
            const whitelistedFolders = whitelist.split(',').map(folder => folder.trim());
            return whitelistedFolders.some(folder => file.includes(path.join(directory, folder)));
        }
        return true;
    });

    stats.totalFiles = files.length;

    files.forEach(file => {
        const moduleName = getModuleName(file);
        const { issues: fileIssues, complexity } = scanFile(file);

        // Initialize module stats if not exists
        if (!stats.moduleStats[moduleName]) {
            stats.moduleStats[moduleName] = {
                totalFiles: 0,
                issuesByChange: {},
                complexity: { Low: 0, Medium: 0, High: 0 }
            };
        }
        stats.moduleStats[moduleName].totalFiles++;

        Object.entries(fileIssues).forEach(([change, paths]) => {
            // Global stats
            if (!stats.issuesByChange[change]) {
                stats.issuesByChange[change] = {
                    count: 0,
                    files: [],
                    complexityByFile: {}
                };
            }
            stats.issuesByChange[change].count += 1;
            stats.issuesByChange[change].files.push(...paths);
            stats.issuesByChange[change].complexityByFile[file] = complexity;

            // Module stats
            if (!stats.moduleStats[moduleName].issuesByChange[change]) {
                stats.moduleStats[moduleName].issuesByChange[change] = {
                    count: 0,
                    files: [],
                    complexityByFile: {}
                };
            }
            stats.moduleStats[moduleName].issuesByChange[change].count += 1;
            stats.moduleStats[moduleName].issuesByChange[change].files.push(...paths);
            stats.moduleStats[moduleName].issuesByChange[change].complexityByFile[file] = complexity;
        });
    });

    // Calculate module complexities
    Object.keys(stats.moduleStats).forEach(moduleName => {
        stats.moduleStats[moduleName].complexity = calculateModuleComplexity(stats.moduleStats[moduleName]);
    });

    // Sort issues by change point number for all stats
    stats.issuesByChange = sortIssuesByChangeNumber(stats.issuesByChange);
    Object.keys(stats.moduleStats).forEach(moduleName => {
        stats.moduleStats[moduleName].issuesByChange = sortIssuesByChangeNumber(stats.moduleStats[moduleName].issuesByChange);
    });

    return stats;
}

// Helper function to sort issues by change number
function sortIssuesByChangeNumber(issues) {
    return Object.fromEntries(
        Object.entries(issues).sort((a, b) => {
            return parseInt(a[0].split('.')[0]) - parseInt(b[0].split('.')[0]);
        })
    );
}

// Function to format file paths
function formatFilePath(filePath, rootDir) {
    return filePath.replace(rootDir, '');
}

// CLI setup
program
    .version('1.0.0')
    .description('Scan Vue 2.7 codebase for Vue 3 breaking changes');

program
    .requiredOption('-f, --folder <path>', 'Path to Vue 2.7 project')
    .option('-d, --details', 'Show detailed report with file paths')
    .option('-w, --whitelist <folders>', 'Comma-separated list of sub-folders to scan')
    .option('-m, --modules', 'Show breakdown by modules')
    .option('-c, --complexity', 'Show complexity score for each file')
    .action(async (options) => {
        console.log(chalk.blue('Scanning for Vue 3 breaking changes...'));
        console.log(chalk.blue('Target folder:', options.folder));
        console.log();

        try {
            const stats = await scanDirectory(options.folder, options.details, options.whitelist);

            // Global Summary
            console.log(chalk.yellow('Global Summary:'));
            console.log(chalk.gray('Total files scanned:', stats.totalFiles));
            console.log();

            Object.entries(stats.issuesByChange).forEach(([change, { count, files, complexityByFile }]) => {
                console.log(chalk.green(`${change}:`), chalk.white(count), 'files');
                
                if (options.details && files.length > 0) {
                    console.log(chalk.gray('Files to check:'));
                    files.forEach(file => {
                        const formattedPath = formatFilePath(file, options.folder);
                        if (options.complexity) {
                            console.log(chalk.gray('  -', formattedPath), chalk.yellow(`(Complexity: ${complexityByFile[file]})`));
                        } else {
                            console.log(chalk.gray('  -', formattedPath));
                        }
                    });
                    console.log();
                }
            });

            // Modules Breakdown
            if (options.modules) {
                console.log(chalk.yellow('\nModules Breakdown:'));
                Object.entries(stats.moduleStats).forEach(([moduleName, moduleStats]) => {
                    console.log(chalk.cyan(`\n${moduleName}:`));
                    console.log(chalk.gray('Files in module:', moduleStats.totalFiles));
                    
                    if (!options.details) {
                        // Show global module complexity percentages
                        console.log(chalk.gray('Module Complexity:'),
                            chalk.green(`Low ${moduleStats.complexity.Low}%`),
                            chalk.yellow(`Medium ${moduleStats.complexity.Medium}%`),
                            chalk.red(`High ${moduleStats.complexity.High}%`)
                        );
                    } else if (moduleStats.complexity.hasHigh) {
                        console.log(chalk.red('Warning: This module contains files with High complexity'));
                    }

                    Object.entries(moduleStats.issuesByChange).forEach(([change, { count, files }]) => {
                        console.log(chalk.green(`  ${change}:`), chalk.white(count), 'files');
                        
                        if (options.details && files.length > 0) {
                            console.log(chalk.gray('  Files to check:'));
                            files.forEach(file => {
                                const formattedPath = formatFilePath(file, options.folder);
                                if (options.complexity) {
                                    // Calculate file complexity using the same logic
                                    const fileIssues = [];
                                    Object.entries(moduleStats.issuesByChange).forEach(([c, { files: f }]) => {
                                        if (f.includes(file)) {
                                            fileIssues.push(c);
                                        }
                                    });
                                    
                                    const score = calculateFileComplexity(fileIssues, {
                                        'Global API Changes': 2,
                                        'v-model Behavior': 2,
                                        'Key Modifiers': 1,
                                        'Event Bus': 2,
                                        'Filters': 1,
                                        'Scoped Slots': 1,
                                        'Lifecycle Hooks': 1,
                                        'Vue.set and Vue.delete': 1,
                                        'Webpack Config': 3,
                                        'Plugin Usage': 2,
                                        'Router/Vuex': 2
                                    });
                                    let complexity = score <= 2 ? 'Low' : score <= 4 ? 'Medium' : 'High';
                                    const complexityColor = {
                                        'Low': 'green',
                                        'Medium': 'yellow',
                                        'High': 'red'
                                    };
                                    
                                    console.log(chalk.gray('    -', formattedPath), 
                                        chalk[complexityColor[complexity]](`(Complexity: ${complexity})`));
                                } else {
                                    console.log(chalk.gray('    -', formattedPath));
                                }
                            });
                            console.log();
                        }
                    });
                });
            }

        } catch (error) {
            console.error(chalk.red('Error:', error.message));
            process.exit(1);
        }
    });

program.parse(process.argv);
