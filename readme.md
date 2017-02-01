# NPM Module Stats

Get the Exact compressed size of any NPM Module without installing / downloading it in your machine. 
The size recursively includes the size of its dependeny tree till leaf.

### Use cases

* At some point, you want to keep your project as small as possible. However if the NPM modules that you use might increase the overall project size.
* Just in case, if your are curious to know what modules will be downloaded with any NPM module.

### Install

Install globally to use it in terminal

`npm install -g npm-module-stats`

Add it to your project dependency

`npm install npm-module-stats --save`


### Usage

```js
var stats = require("npm-module-stats");

stats.getStats("glob").then((stack) => {

  let dependencies = Object.keys(stack);
  let totalSize = dependencies.reduce((result, key, index) => {
    return result + stack[key].size;
  }, 0);

  console.log('Total Size in Bytes ', totalSize);
  console.log('Total Dependencies ', dependencies.length-1);

}).catch((err) => {
  console.error(err);
});
```

### Command line Usage

`npm-module-stats --name=glob`

### Help

`npm-module-stats --help` 

```bash
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
  npm-module-stats --name=glob --m --verbose  "verbose output "
```

### Output

```
┌───────┬──────────────────┬─────────┬───────────────────┬─────────────────────────┐
│ INDEX │ NAME             │ VERSION │ SIZE              │ DEPS                    │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 1     │ inherits         │ 2.0.3   │ 2.03 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 2     │ path-is-absolute │ 1.0.1   │ 1.88 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 3     │ fs.realpath      │ 1.0.0   │ 4.43 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 4     │ wrappy           │ 1.0.2   │ 1.68 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 5     │ once             │ 1.4.0   │ 1.98 kB           │ wrappy@1                │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 6     │ inflight         │ 1.0.6   │ 2.04 kB           │ once@^1.3.0             │
│       │                  │         │                   │ wrappy@1                │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 7     │ concat-map       │ 0.0.1   │ 2.26 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 8     │ balanced-match   │ 0.4.2   │ 2.55 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 9     │ brace-expansion  │ 1.1.6   │ 3.88 kB           │ balanced-match@^0.4.1   │
│       │                  │         │                   │ concat-map@0.0.1        │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 10    │ minimatch        │ 3.0.3   │ 11.4 kB           │ brace-expansion@^1.0.0  │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│ 11    │ glob             │ 7.1.1   │ 15.6 kB           │ fs.realpath@^1.0.0      │
│       │                  │         │                   │ inflight@^1.0.4         │
│       │                  │         │                   │ inherits@2              │
│       │                  │         │                   │ minimatch@^3.0.2        │
│       │                  │         │                   │ once@^1.3.0             │
│       │                  │         │                   │ path-is-absolute@^1.0.0 │
├───────┼──────────────────┼─────────┼───────────────────┼─────────────────────────┤
│       │                  │         │ Exact compressed  │                         │
│       │                  │         │ file size         │                         │
│       │                  │         │ 49.7 kB           │                         │
├───────┼──────────────────┼─────────┼───────────────────┤                         │
│       │                  │         │ Appromixate file  │                         │
│       │                  │         │ size after        │                         │
│       │                  │         │ uncompression     │                         │
│       │                  │         │ 149 kB            │                         │
└───────┴──────────────────┴─────────┴───────────────────┴─────────────────────────┘
```

### How Does it Work

Npm compresses and store the packages as gzipped tarballs. *npm-module-stats* recursively reads the content-length of the tarball header and knows the size of the same. The uncompressed size of a gzipped tarballs would be 3-4 times of the compressed one.

### Author

Abraham Jagadeesh