# Vue Migration Tools

This repository contains tools and documentation for migrating Vue 2.7 applications to Vue 3.

## Installation

You can install the necessary dependencies by running:

```bash
npm install
```

## Usage

To run the Vue breaking changes scanner, you can use the following command:

```bash
npx vbcs --folder /home/user/repos/project --whitelist src --details --modules --complexity
```

### Command Options:
- `--folder`: Specify the directory to scan for Vue files.
- `--whitelist`: Limit scanning to specified sub-folders.
- `--details`: Provide detailed output of breaking changes.
- `--modules`: Breakdown of breaking changes by module.
- `--complexity`: Assign complexity scores to each file based on breaking changes.

## Example

To run the scanner with specific options, use:

```bash
npx vbcs --folder /home/user/repos/project --whitelist src --details --modules --complexity
```

## Modules Calculation Logic

The scanner analyzes the directory structure and identifies modules based on the following criteria:

1. **Directory Structure**: Each sub-folder within the specified folder is treated as a module. The scanner will look for Vue components and related files in these directories.

2. **Breaking Changes**: The scanner evaluates the breaking changes found in each module by analyzing the Vue files within it. It categorizes the changes based on predefined logic to determine the complexity of each module.

3. **Complexity Scoring**: Each file's breaking changes are scored based on their impact, and the overall complexity of the module is derived from the scores of its constituent files. The complexity is then classified as Low, Medium, or High.

4. **Output**: When using the `--modules` option, the scanner provides a breakdown of breaking changes by module, along with the complexity scores for each module.

This logic helps in organizing the migration process and prioritizing modules that require more attention during the migration from Vue 2.7 to Vue 3.

## Groq-Powered AI Analysis

This CLI tool includes a Groq-powered AI analysis feature that helps identify migration changes for Vue Single File Components (SFC).

### Usage

To analyze a specific Vue SFC, use the following command:

```bash
npx vbcs --analyze --file ./path/to/your/component.vue
```

### Required Environment Variable

Before using the analysis feature, ensure that the `GROQ_API_KEY` environment variable is set. You can set it in your terminal as follows:

```bash
export GROQ_API_KEY='your-api-key-here'
```

This key is necessary for authenticating requests to the Groq AI service.

### Example

After setting the environment variable, you can run the analysis command to get insights on migration changes for your Vue component.

## Contributing

Feel free to submit issues or pull requests to improve the tools and documentation!
