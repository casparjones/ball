<?php
$index = file_get_contents("../index.html");
$index = str_replace('public', '', $index);
echo $index;
