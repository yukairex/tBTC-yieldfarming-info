$(function () {
  consoleInit();
  start(main);
});

async function main() {
  const App = await init_ethers();
}
