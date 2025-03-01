console.log("Eternal Fall Game Loop Initialized!");

function gameLoop() {
    console.log("Updating game...");
    requestAnimationFrame(gameLoop); // Keeps the game loop going
}

gameLoop(); // Start the game loop
