<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>绑定成功</title>
    <link rel="stylesheet" type="text/css" href="http://libs.useso.com/js/bootstrap/3.2.0/css/bootstrap.css" />
    <style type="text/css">
    th { width: 150px; text-align: right; }
    </style>
  </head>
  <body>
    <div class="container">
      <h3>绑定成功</h3>
      <table width="100%" cellpadding="0" cellspacing="0" class="table">
        <tr>
          <th>Access Token</th><td>{{.access_token}}</td>
        </tr>
        <tr>
          <th>有效期</th><td>{{.expires}}</td>
        </tr>
      </table>
      <div class="btn-group">
        <button class="btn btn-success" id="close">关闭</button>
      </div>
    </div>
    <script type="text/javascript">
    document.getElementById('close').onclick = function() {
      try {
        window.close();
      }
      catch(ex){}
    };
    </script>
  </body>
</html>
