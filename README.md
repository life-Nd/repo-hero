#  🥷   Repo 🔍 🔎 Hero 🚀

Repo Hero is an enhanced GitHub Action derived from the original [Repo Visualizer](https://github.com/life-Nd/repo-hero), offering an advanced approach to repository exploration. Alongside generating SVG diagrams of your codebase, Repo Hero introduces a valuable addition -- a detailed JSON file containing comprehensive information about each file and its size. Read more in the [original write-up](https://octo.github.com/projects/repo-visualization).

**Note: Repo Hero is an experimental project. Your feature requests and contributions are welcome via PRs or forks.**

For a full demonstration, check out the [life-Nd/repo-hero-demo](https://github.com/life-Nd/repo-hero-demo) repository.

## Key Features

- **`SVG Code Visualization:`** Create clear and informative SVG diagrams representing your repository's structure.
- **`Detailed File Information (NEW)`:** Generate a JSON file containing paths and sizes of all files in your repository.
- **`Customization Options`:** Tailor the diagram's appearance with excluded paths, globs, colors, and root directory selection.
- **`Flexible Output`:** Choose between creating a new commit with the diagram, downloading it as an artifact, or accessing the SVG data directly within your workflow.

## Why Use Repo Hero?

Repo Hero empowers you to:

- **`Optimize API Calls`:** Avoid unnecessary GitHub API calls by having file size information readily available, especially beneficial for exploring large repositories.
- **`Gain Deeper Insights`:** Analyze file size distribution within your project to identify areas for potential optimization or refactoring.

## How it Works

1. Include the `Repo-Hero` action in your workflow.
2. Configure the desired behavior using the available inputs.


## *Example* Usage

#### 1. Checkout Code and Generate Repo-Hero Data:
You'll need to run the actions/checkout Action beforehand, to check out the code.

```yaml
- name: Checkout code
  uses: actions/checkout@v2
- name: Generate Repo Hero data
  uses: life-Nd/repo-hero@v<latest_version>
  with:
    output_file: "images/diagram.svg"
    excluded_paths: "dist,node_modules"
```
#### 2. Accessing the Data

By default, this action will create a new commit with the diagram on the specified branch.

If you want to avoid new commits, you can create an artifact to accompany the workflow run, by specifying an artifact_name. You can then download the diagram using the actions/download-artifact action from a later step in your workflow, or by using the GitHub API.

*Example*:
```yaml
- name: Update diagram
  id: make_diagram
  uses: life-Nd/repo-hero@0.7.1
  with:
    output_file: "output-diagram.svg"
    artifact_name: "my-diagram"
- name: Get artifact
  uses: actions/download-artifact@v2
  with:
    name: "my-diagram"
    path: "downloads"
```



#### 3.  Leverage File Size Information in Your Code:

```python

# Example: Python - assuming the JSON file is named 'repo_data.json'
import json

with open('repo_data.json') as f:
  data = json.load(f)

  # Access file information here
  for entry in data:
      print(f"Path: {entry['path']}, Size: {entry['size']}")`

```

## Inputs

### `output_file`

A path (relative to the root of your repo) to where you would like the diagram to live.

For *example*: images/diagram.svg

Default: diagram.svg

### `excluded_paths`

A list of paths to folders to exclude from the diagram, separated by commas.

For *example*: dist,node_modules

Default: node_modules,bower_components,dist,out,build,eject,.next,.netlify,.yarn,.vscode,package-lock.json,yarn.lock

### `excluded_globs`

A semicolon-delimited array of file [globs](https://globster.xyz/) to exclude from the diagram, using [micromatch](https://github.com/micromatch/micromatch) syntax. Provided as an array.

***Example***:

```yaml
excluded_globs: "frontend/*.spec.js;**/*.{png,jpg};**/!(*.module).ts"
# Guide:
# - 'frontend/*.spec.js' # exclude frontend tests
# - '**/*.{png,ico,md}'  # all png, ico, md files in any directory
# - '**/!(*.module).ts'  # all TS files except module files
```

### `root_path`

The directory (and its children) that you want to visualize in the diagram, relative to the repository root.

For *example*: `src/`

Default: `''` (current directory)

### `max_depth`

The maximum number of nested folders to show files within. A higher number will take longer to render.

Default: 9

### `should_push`

Whether to make a new commit with the diagram and push it to the original repository.

Should be a boolean value, i.e. `true` or `false`. See `commit_message` and `branch` for how to customise the commit.

Default: `true`

### `commit_message`

The commit message to use when updating the diagram. Useful for skipping CI. For *example*: `Updating diagram [skip ci]`

Default: `Repo hero: updated diagram`

### `branch`

The branch name to push the diagram to (branch will be created if it does not yet exist).

For *example*: `diagram`

### `artifact_name`

The name of an [artifact](https://docs.github.com/en/actions/guides/storing-workflow-data-as-artifacts) to create containing the diagram.

If unspecified, no artifact will be created.

Default: `''` (no artifact)

### `file_colors`

You can customize the colors for specific file extensions. Key/value pairs will extend the [default colors](https://github.com/life-Nd/repo-hero/pull/src/language-colors.json).

For *example*: '{"js": "red","ts": "green"}'
default: '{}'

## Outputs

### `svg`

The contents of the diagram as text. This can be used if you don't want to handle new files.

```
😎 Enhance your repo exploration experience with Repo-Hero! 
```