export function layout(body: any) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ClickUp IDs</title>
    <!-- bootstrap 5 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1>ClickUp IDs</h1>
                <p>ClickUp IDs is a tool to help you find the IDs of your ClickUp spaces, folders, lists, and tasks.</p>
                
                ${body}
            </div>
        </div>
    </div>
</body>
</html>`
}
