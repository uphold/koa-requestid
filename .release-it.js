module.exports = {
  git: {
    changelog: 'echo "## Changelog\\n\\n$(npx @uphold/github-changelog-generator -f unreleased | tail -n +4 -f)"',
    commitMessage: 'Release ${version}',
    requireBranch: 'master',
    requireCommits: true,
    tagName: 'v${version}'
  },
  github: {
    release: true,
    releaseName: 'v${version}'
  },
  hooks: {
    'after:bump': `
      npm run build &&
      echo "$(npx @uphold/github-changelog-generator -f \${version} -t v\${version})\n$(tail -n +2 CHANGELOG.md)" > CHANGELOG.md &&
      grep -v "dist" .gitignore > .gitignore.tmp && mv .gitignore.tmp .gitignore &&
      git add dist CHANGELOG.md --all &&
      git checkout .gitignore
    `
  },
  npm: {
    publish: false
  }
};
