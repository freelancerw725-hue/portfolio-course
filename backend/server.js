const app = require("./src/app");
const config = require("./src/config/env");

app.listen(config.port, () => {
  console.log(
    `PayU backend listening on port ${config.port} in ${config.payuMode} mode.`
  );
});
