const sql = require("mysql");


// const connection = sql.createPool({
//   host: "localhost",
//   user: "metecxjn_db",
//   password: "metecxjn_db",
//   database: "metecxjn_db",
// });

const connection = sql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "alldb",
});



// const connection = sql.createPool({
//   host: "192.168.64.3",
//   user: "alldb",
//   password: "",
//   database: "alldb",
// });

connection.query(
  "CREATE TABLE IF NOT EXISTS miningusers(id int(11) AUTO_INCREMENT NOT NULL, fullname TEXT(1000) NOT NULL, username TEXT(1000) NULL, address TEXT(1000) NULL, country TEXT(1000) NULL, phone TEXT(1000) NOT NULL, ref TEXT(1000) NULL, bonus TEXT(1000) NULL, email TEXT(1000) NOT NULL, password TEXT(1000) NOT NULL, repeat_password TEXT(1000) NOT NULL, PRIMARY KEY(id))",
  (err, result) => {
    if (err) console.log(err);
    else {

      connection.query(
        "CREATE TABLE IF NOT EXISTS contact(id int(11) AUTO_INCREMENT NOT NULL, name TEXT(1000) NOT NULL, phone TEXT(1000) NOT NULL, email TEXT(1000) NOT NULL, subject TEXT(1000) NOT NULL, message TEXT(1000) NOT NULL, PRIMARY KEY(id))",
        async (err, result) => {
          if (err) console.log(err);
          else {
            await connection.query(
              "create table if not exists receipts(id int(11) auto_increment not null, user_id int(11) not null, ref_amt int(11) default(0), receiptImg text(1000) not null, roi text(1000) null, withdraw_req text(1000) null, status text(1000) not null, package text(1000) not null, amount text(1000) not null, depositdate date null, duedate date null, reference text(1000) null, primary key(id), FOREIGN KEY(user_id) REFERENCES miningusers(id) ON DELETE CASCADE ON UPDATE CASCADE)",
              async (err, result) => {
                if (err) console.log(err);
                else {
                  await connection.query(
                    "create table if not exists withdrawal(id int(11) auto_increment not null, user_id int(11) not null, receiptID int(11) not null, wallet text(1000) not null, roi text(1000) null, primary key(id), FOREIGN KEY(user_id) REFERENCES miningusers(id), FOREIGN KEY(receiptID) REFERENCES receipts(id) ON DELETE CASCADE ON UPDATE CASCADE)",
                    (err, result) => {
                      if (err) console.log(err);
                    }
                  );
                }
              }
            );
          }
        }
      );







      connection.query(
        "CREATE TABLE IF NOT EXISTS miningadmin(id int(11) AUTO_INCREMENT NOT NULL, fullname TEXT(1000)  NULL, username TEXT(1000)  NULL, phone TEXT(1000)  NULL, email TEXT(1000) NOT NULL, password TEXT(1000) NOT NULL, repeat_password TEXT(1000) NULL, PRIMARY KEY(id))",
        (err, result) => {
          if (err) console.log(err);
        }
      );


    }
  }
);

module.exports = connection;
