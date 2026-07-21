const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("GALIA_V1", "GaliAdmin", "Gali@", {
  host: "172.20.53.10",
  dialect: "mssql",
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connect();



module.exports = sequelize; // Exportez directement `sequelize`
