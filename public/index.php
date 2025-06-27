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
        <select id="modeSelect" style="display:block;margin:10px auto;">
            <option value="carousel">Carousel</option>
            <option value="random">Random Number</option>
        </select>
        <canvas id="gameCanvas" width="<?php echo $canvasWidth; ?>" height="<?php echo $canvasHeight; ?>"></canvas>
    </div>

    <script type="module" src="main.js"></script>
</body>
</html>