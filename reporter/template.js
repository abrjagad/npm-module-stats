module.exports = function statsTemplate(name, result, totalSize, appSize) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>NPM-module-stats HTML reporter</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
    crossorigin="anonymous">
</head>

<body>
  <div class="container">
  <div class="row panel panel-default">
   <h1>${name}</h1>
   <table class="table table-striped">
    <tr>
      <th class="col-sm-1">Index</th>
      <th class="col-sm-3">Name</th>
      <th class="col-sm-2">Version</th>
      <th class="col-sm-2">Size</th>
      <th class="col-sm-4">Dependencies</th>
    </tr>
      ${result}
    <tr>
      <td class="col-sm-1"></td>
      <td class="col-sm-3"></td>
      <td class="col-sm-2"></td>
      <td class="col-sm-2">Exact compressed file size ${totalSize}</td>
      <td class="col-sm-4"></td>
    </tr>
    <tr>
      <td class="col-sm-1"></td>
      <td class="col-sm-3"></td>
      <td class="col-sm-2"></td>
      <td class="col-sm-2">Appromixate file size after uncompression ${appSize}</td>
      <td class="col-sm-4"></td>
    </tr>
      
   </table>
   </div>
   </div>
</body>

</html>`;
};
