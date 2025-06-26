<?php
$title = "Rotierender Kreis mit hüpfendem Ball";
$canvasWidth = 800;
$canvasHeight = 800;
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas" width="<?php echo $canvasWidth; ?>" height="<?php echo $canvasHeight; ?>"></canvas>
    </div>

    <script src="collision.js"></script>
    <script src="game.js"></script>
</body>
</html>