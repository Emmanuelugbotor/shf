const sql = require("./db.config");
const bcrypt = require("bcryptjs");
const saltRounds = 10;



exports.selectByOne = (databaseTable, column, selectValue, result) => {
  sql.query(`SELECT * FROM ${databaseTable} WHERE ${column} = ?`, [selectValue], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.data = async (id, result) => {
  await sql.query(`SELECT fullname, phone, bonus, ref, email FROM miningusers WHERE id=?`, [id], async (err, output) => {
 
    if (err) return result(err, null)
    return result(null, output)
  })
};

exports.forgetPassword = async (userID, result) => {
  await sql.query(`SELECT id, email FROM miningusers WHERE email = ?`, [userID], (err, resp) => {
    if (err){
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (resp.length) {
      console.log("found customer: ", resp[0]);
      result(null, resp[0]);
      return;
    }
      result({ kind: "not_found" }, null);
    
    // not found Customer with the id `
  });
};

exports.updateOtp = async (id, otp, result) => {
  await sql.query(
    "UPDATE miningusers SET username = ? WHERE id = ?",
    [otp, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      return result(null, res);
    }
  );
};

exports.getOtpVerifications = (userID, result) => {

  sql.query(`SELECT id, email, username FROM miningusers WHERE id = ${userID}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Customer with the id
    result(null, []);
  });

};

exports.resetConfirmedPassword = (id, password, result) => {
  
  sql.query(
    "UPDATE miningusers SET password = ? WHERE id = ?",
    [password, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated verified: ", { res });
      result(null, { id: id });
    }
  );
};


exports.userPackage = async (userID, result) => {
  await sql.query(`SELECT * FROM receipts WHERE user_id=?`, [userID], async (err, output) => {
      if (err) return result(err, null);
      else{
        await sql.query(`SELECT ref FROM miningusers WHERE ref=${userID} `, async(errs, numOfRef)=>{
          if (errs) return result(errs, output, null);
          else{
                await sql.query(`SELECT * FROM receipts WHERE reference=?`, [userID], async (err, refData) => {
                    if (err) return result(err, output, numOfRef, null)
                    else{
                          await sql.query(`SELECT bonus FROM miningusers WHERE id=${userID} `, async(bonusError, bonusRes)=>{
                            if(bonusError) return result(err, output, refData, numOfRef, null); 
                            else {
                              return result(err, output, refData, numOfRef, bonusRes); 
                            }
                          });
                    }
                  });
          }
        })
      }
    }
  );
};
// exports.validateFields = (tablename, column, data, result) => {
//   sql.query(`SELECT * FROM ${tablename} WHERE ${column} = ?`, [data], (err, output) => {
//     if (err) return result(err, null);
//     return result(null, output);
//   });
// };

exports.emailPasswordValidate = (email, userId, result) => {
  sql.query(`SELECT * FROM miningusers WHERE email = ? AND id=?`, [email, userId], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.adminEmailValidate = (email, userId, result) => {
  sql.query(`SELECT * FROM miningadmin WHERE email = ? AND id=?`, [email, userId], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};

exports.updateBonus = async (amount, userID, result) => {
  sql.query(
    `UPDATE miningusers SET bonus=? WHERE id=?`,
    [ amount, userID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};

exports.insertUsers = (tablename, userObj, result) => {
  sql.query(`INSERT INTO ${tablename} SET ?`, [userObj], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};


exports.userReceipts = (receiptImg, status, package, amount, user_id, reference, result) => {
  sql.query(
    `INSERT INTO receipts(receiptImg, status, package, amount, user_id, reference) VALUES(?,?,?,?,?,?)`,
    [receiptImg, status, package, amount, user_id, reference],
    async (err, output) => {
      if (err) {
        console.log(err);
        return result(err, null)
      }
      return result(null, output);
    }
  );
};


exports.withdrawalRequest = (wallet, user_id, roi, receiptID, result) => {
  sql.query(
    `INSERT INTO withdrawal(wallet, user_id, roi, receiptID) VALUES(?,?,?,?)`,
    [wallet, user_id, roi, receiptID],
    async (err, output) => {
      if (err) return result(err, null);
      return result(null, output);
    }
  );
};



exports.checkAdmin = (adminObj, result) => {
  sql.query( 
    `SELECT * FROM miningadmin WHERE email = ?`,
    [adminObj.email],
    async (err, output) => {
      if (err) return result(err, null);
      return result(null, output);
    }
  );
};


exports.getUserInfo = async (result) => {

  await sql.query(`SELECT * FROM miningusers ORDER BY ID DESC`, async (err, output) => {
   
    if (err) return result(err, null);
    else {
      await sql.query(`SELECT * FROM receipts ORDER BY id DESC`, async (receiptErr, receiptResult) => {
        if (receiptErr) return result(err, output, null);
        else {
          await sql.query(`SELECT * FROM contact`, async (emailErr, newletter)=>{
            if (emailErr) return result(err, output, receiptResult, null);
            else{
              await sql.query(`SELECT wallet, receiptID, user_id, fullname, email, roi, phone, withdrawal.id AS wID FROM withdrawal INNER JOIN miningusers ON(miningusers.id = withdrawal.user_id)`, async (withErr, withResponse)=>{
                // console.log(withResponse)
                if (withErr) return result(err, output, receiptResult, newletter, null);
                else{
                  return result(null, output, receiptResult, newletter, withResponse);
                }
            })
            }
          })
        }
      });
    }
  });
};



exports.planStatusUpdate = async (
  userID,
  receiptID,
  depositedate,
  duedate,
  result
) => {
  sql.query(
    `UPDATE receipts SET status=?, depositdate=?, duedate=? WHERE user_id=? AND id=?`,
    ["Active", depositedate, duedate, userID, receiptID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};


exports.updatePassword = async (password, newPassword, userID, result) => {
  sql.query(
    `UPDATE miningusers SET password=?, repeat_password=? WHERE id=?`,
    [ password, newPassword, userID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};

exports.updateAdminPassword = async (password, userID, result) => {
  sql.query(
    `UPDATE miningadmin SET password=? WHERE id=?`,
    [ password, userID],
    (err, output) => {
      if (err) return console.log(err), result(err, null);
      return result(null, output);
    }
  );
};




exports.deleteUser = async(userID, result) => {
  sql.query(`DELETE FROM miningusers WHERE id = ?`, [userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.removemsg = async(userID, result) => {
  sql.query(`DELETE FROM contact WHERE id = ?`, [userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.deletePlan = async(plandID, userID, result) => {
  sql.query(`DELETE FROM receipts WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}

exports.deleteApprovedWithdrawal = async(plandID, userID, result) => {
  sql.query(`DELETE FROM withdrawal WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output);
  })
}

exports.approvedWithdrawal = async(plandID, userID, result) => {

  sql.query(`SELECT * FROM receipts WHERE id = ? AND user_id=?`, [plandID, userID], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })

}

exports.contact = (userObj, result) => {
  sql.query(`INSERT INTO contact SET ?`, [userObj], (err, output) => {
    if (err) return result(err, null);
    return result(null, output);
  });
};


exports.createAdmin = async(adminData, result) => {
  sql.query(`INSERT INTO miningadmin SET ?`, [adminData], (err, output) => {
    if (err) return result(err, null)
    return result(null,output)
  })
}















const insertAdmin = async (result) => {
  const adminPassword = "admin@gmail.com";
  const adminEmail = "admin@gmail.com";

  const encryptedAdminPass = await bcrypt.hash(adminPassword, saltRounds);
  adminObj = {
    email: adminEmail,
    password: encryptedAdminPass,
  }; 

  sql.query(`INSERT INTO miningadmin SET ?`, [adminObj], async (err, output) => {
    if (err) {
      return result(err, null);
    } else {
      return result(null, output);
    }
  });
};



// insertAdmin((err, result)=>{
//   if(err) console.log(err)
// })
