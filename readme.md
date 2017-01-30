# NPM Module Size

Get the approximate size of any NPM Module without installing / downloading it in your machine. 
The size recursively includes the size of its dependencies and devdependencies' dependencies.

### Use cases

* At some point, you want to keep your project as small as possible. However if the NPM modules that you use might increase the overall project size.
* Just in case, if your are curious to know what modules will be downloaded with any NPM module.

### Install

```
//install globally to use it in terminal
npm install -g npm-module-stats
```

```
//add it to your project dependency
npm install npm-module-stats --save
```


### Usage

```
var stats = require("npm-module-stats");

stats.getStats("glob").then((stack) => {

  let dependencies = Object.keys(stack);
  let totalSize = dependencies.reduce((result, key, index) => {
    return result + stack[key].size;
  }, 0);

  console.log('Total Size ', totalSize);
  console.log('Total Dependencies ', dependencies.length);

}).catch((err) => {
  console.error(err);
});
```

### Command line Usage

```
npm-module-stats --name=glob
```

### Help

```
npm-module-stats --help
``` 

```
npm-module-stats --name=glob

Options:
  --name, -n     Name of the NPM module to get stats for               [string] [required]
  --minimal, -m  Stats in text representation                                    [boolean]
  --verbose      Verbose output                                                  [boolean]
  --help         Show help                                                       [boolean]

Examples:
  npm-module-stats --n=glob             "Draw a statistics table for the latest version "
  npm-module-stats --n=glob@6.0.1       "Draw a statistics table for the specific version
                                        "
  npm-module-stats --n=glob --m         "Recursive total size "
  npm-module-stats --name=glob --m --v  "verbose output "
```

### Output

``` 
┌───────┬──────────────────┬─────────┬───────┬─────────────────────────┐
│ INDEX │ NAME             │ VERSION │ SIZE  │ DEPS                    │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 1     │ inherits         │ 2.0.3   │ 2028  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 2     │ fs.realpath      │ 1.0.0   │ 4434  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 3     │ path-is-absolute │ 1.0.1   │ 1882  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 4     │ wrappy           │ 1.0.2   │ 1676  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 5     │ once             │ 1.4.0   │ 1979  │ wrappy@1                │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 6     │ inflight         │ 1.0.6   │ 2041  │ once@^1.3.0             │
│       │                  │         │       │ wrappy@1                │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 7     │ balanced-match   │ 0.4.2   │ 2550  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 8     │ concat-map       │ 0.0.1   │ 2263  │                         │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 9     │ brace-expansion  │ 1.1.6   │ 3876  │ balanced-match@^0.4.1   │
│       │                  │         │       │ concat-map@0.0.1        │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 10    │ minimatch        │ 3.0.3   │ 11392 │ brace-expansion@^1.0.0  │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│ 11    │ glob             │ 7.1.1   │ 15617 │ fs.realpath@^1.0.0      │
│       │                  │         │       │ inflight@^1.0.4         │
│       │                  │         │       │ inherits@2              │
│       │                  │         │       │ minimatch@^3.0.2        │
│       │                  │         │       │ once@^1.3.0             │
│       │                  │         │       │ path-is-absolute@^1.0.0 │
├───────┼──────────────────┼─────────┼───────┼─────────────────────────┤
│       │                  │         │ 49738 │                         │
└───────┴──────────────────┴─────────┴───────┴─────────────────────────┘
```
