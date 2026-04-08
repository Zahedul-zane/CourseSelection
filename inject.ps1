$b64 = Get-Content -Path "f:\Course selection\b64.txt" -Raw
$html = @"
<!DOCTYPE html>
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
</head>
<body>
<div id="out">Processing...</div>
<script>
    var b64 = "$b64";
    var binaryString = window.atob(b64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    var wb = XLSX.read(bytes.buffer, {type:'array'});
    var wsname = wb.SheetNames[0];
    var ws = wb.Sheets[wsname];
    var json = XLSX.utils.sheet_to_json(ws);
    
    let result = [];
    for(let row of json) {
      result.push(row);
    }
    document.getElementById('out').innerText = JSON.stringify(result);
</script>
</body>
</html>
"@
Set-Content -Path "f:\Course selection\parse4.html" -Value $html
