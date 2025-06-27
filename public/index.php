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
    <button id="statsButton" style="position:absolute;top:10px;right:120px;z-index:10;">Show Statistik</button>
    <div id="statsPopup" style="display:none;position:absolute;top:40px;right:10px;background:rgba(0,0,0,0.8);color:#fff;padding:10px;border-radius:4px;font-size:12px;"></div>
    <div id="gameContainer">
        <select id="modeSelect" style="display:block;margin:10px auto;">
            <option value="carousel">Carousel</option>
            <option value="random">Random Number</option>
            <option value="lotto">Lotto Simulation</option>
        </select>
        <canvas id="gameCanvas" width="<?php echo $canvasWidth; ?>" height="<?php echo $canvasHeight; ?>"></canvas>
    </div>

    <script type="module" src="main.js"></script>
</body>
</html>