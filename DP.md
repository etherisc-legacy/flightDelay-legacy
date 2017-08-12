# CI/CD

## Git flow workflow

The main trunks: master and develop. Master holds latest release and develop holds latest "stable" development copy.

Contributors create feature branches (prefixed with feature/ by convention) off of develop:

#### Prefixes for branches:

- SC_ prefix releates to smart contracts
- DP_ prefix relates to development process definitions
- INF_ prefix relates to infrastructure
- TST_ prefix relates to tests
- MIG_ prefix relates to migrations

$ git checkout -b feature/prefix-feature develop
and hotfix branches (prefixed with hotfix/ by convention) off of master:

#### Hotfix the latest version of master
```
$
```

#### or hotfix from a specific version
```
$
```
These branches are "disposable", meaning they have a short lifespan before they are merged back to the main trunks. They are meant to encapsulate small pieces of functionality.

### Finishing branches

When a contributor is done with a feature branch, they merge it back into develop:
```
$
```

When it's done with a hotfix branch, merge it back into both master and develop so the hotfix carries forward:

```
$
```

### Releases

### Tagging

### Merging

