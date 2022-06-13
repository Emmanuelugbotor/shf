const db = require("../models/models");
const { Packages } = require("../utils/packages");
const {generatePdf, sendOtp, sendBonusSms} = require("../utils/email.controller")
const sql = require("../models/db.config");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

// generatePdf()
exports.adminDashboard = async (req, res) => {
  await db.getUserInfo((err, users, receipts, newletter, withResponse) => {
    if (err) return res.render("admin", { err, error: req.flash("error") });
    else {
      // console.log(withResponse);
      res.render("admin", {
        result: users,
        receipts,
        newletter,
        withResponse,
        error: req.flash("error"),
        emailDel: req.flash("error"),
      });
    }
  });
};

exports.approveplan = async (req, res) => {
  var ref;

  let { receiptID, userID, packageplan } = req.params;

  let duration = parseInt(
    Packages[packageplan.split("$")[0]][
      packageplan.split("$")[1]
    ].Duration.split(" ")[0]
  );
  let deposit_date = new Date();
  let now = new Date();
  let due_Date_converter = now.setTime(
    now.getTime() + duration * 24 * 60 * 60 * 1000
  );
  let due_date = new Date(due_Date_converter);


  await db.planStatusUpdate(
    userID,
    receiptID,
    deposit_date,
    due_date,
    async (err, result) => {
      if (err)
        return (
          req.flash("error", "network error"),
          res.redirect("back")
        );
      return (
        req.flash("error", "Approved Successfuly"),
        res.redirect("back")
      );
    }
  );

  // await sql.query(
  //   `SELECT ref FROM miningusers WHERE id=?`,
  //   [userID],
  //   async (err, output) => {
  //     if (err)
  //       console.log(err),
  //         req.flash("error", "network error"),
  //         res.redirect("back");
  //     else {
  //       for (var obj of output) {
  //         ref = parseInt(obj.ref); 
  //       }
  //       if (isNaN(ref)) {
  //         await db.planStatusUpdate(
  //           userID,
  //           receiptID,
  //           deposit_date,
  //           due_date,
  //           async (err, result) => {
  //             if (err)
  //               return (
  //                 req.flash("error", "network error"), res.redirect("back")
  //               );
  //             return (
  //               req.flash("error", "Approved Successfuly"), res.redirect("back")
  //             );
  //           }
  //         );
  //       } else {
          
  //         await sql.query(
  //           `SELECT status, id, amount FROM receipts WHERE user_id = ? AND status=?`,
  //           [ref, "Active"],
  //           async (erro, solut) => {
  //             if (erro)
  //               console.log(erro),
  //                 req.flash("error", "network error"),
  //                 res.redirect("back");
  //             else {
  //               if (Object.entries(solut).length > 0) {
  //                 var id, status, amount;
  //                 for (var obj = 0; obj < solut.length; obj++) {
  //                   id = solut[0].id;
  //                   status = solut[0].status;
  //                   amount = solut[0].amount;
  //                 }
  //                 let updatedmt =
  //                   (10 / 100) * parseInt(amount) + parseInt(amount);
  //                 await sql.query(
  //                   `UPDATE receipts SET amount=? WHERE id=? AND user_id=?`,
  //                   [updatedmt, id, ref],
  //                   async (err, ans) => {
  //                     if (erro)
  //                       console.log(erro),
  //                         req.flash("error", "network error"),
  //                         res.redirect("back");
  //                     else {
  //                       await db.planStatusUpdate(
  //                         userID,
  //                         receiptID,
  //                         deposit_date,
  //                         due_date,
  //                         async (err, result) => {
  //                           if (err)
  //                             return (
  //                               req.flash("error", "network error"),
  //                               res.redirect("back")
  //                             );
  //                           return (
  //                             req.flash("error", "Approved Successfuly"),
  //                             res.redirect("back")
  //                           );
  //                         }
  //                       );
  //                     }
  //                   }
  //                 );
  //               }

  //               else {

  //                 await db.planStatusUpdate(
  //                   userID,
  //                   receiptID,
  //                   deposit_date,
  //                   due_date,
  //                   async (err, result) => {
  //                     if (err)
  //                       return (
  //                         req.flash("error", "network error"),
  //                         res.redirect("back")
  //                       );
  //                     return (
  //                       req.flash("error", "Approved Successfuly"),
  //                       res.redirect("back")
  //                     );
  //                   }
  //                 );
  //               }
  //             }
  //           }
  //         );
  //       }
  //     }
  //   }
  // );
};

exports.removeUser = async (req, res) => {
  let { id } = req.params;
  await db.deleteUser(parseInt(id), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return (
      req.flash("error", "User Successfully Deleted"), res.redirect("back")
    );
  });
};

exports.removemsg = async (req, res) => {
  let { id } = req.params;
  await db.removemsg(parseInt(id), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return (
      req.flash("error", "Email Successfully Deleted"), res.redirect("back")
    );
  });
};

exports.deletePlans = async (req, res) => {
  let { planID, userID } = req.params;
  await db.deletePlan(parseInt(planID), parseInt(userID), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return req.flash("error", "Successfully Deleted"), res.redirect("back");
  });
};

exports.deleteApprovedWithdrawal = async (req, res) => {
  let { planID, userID } = req.params;
  await db.deleteApprovedWithdrawal(parseInt(planID), parseInt(userID), (err, output) => {
    if (err) return req.flash("error", "network error"), res.redirect("back");
    return req.flash("error", "Successfully Deleted"), res.redirect("back");
  });
};

exports.approvedWithdrawal = async (req, res) => {
  let { username, email, wallet, roi, receiptID, user_id } = req.params;
  console.log("THe amout of money  ", roi)
  await sql.query("SELECT withdraw_req, ref_amt, amount FROM receipts WHERE id=? AND user_id=?", [parseInt(receiptID), parseInt(user_id) ], async (err, results)=>{
    if(err) return console.log(err), req.flash("error", "Network Error"), res.redirect("back");
    else{
      let { withdraw_req, amount, ref_amt } = results[0]
      if(parseInt(ref_amt) == 0){
        ref_amt = amount
      }
      let addedWithdraw = parseInt(withdraw_req)  + parseInt(roi);
      let reducedCapital = (parseInt(amount) - parseInt(roi))
      console.log(`${username} REQUESTED FOR A WITHDRAW WITH THE AMOUNT OF ${roi}`)
      let userObject = {
        username, email, wallet, roi  
      }
     
          await generatePdf(userObject, async (err, result)=>{
            if(err) return console.log(err), req.flash("error", "Network Error !, please connect to good network and try again"), res.redirect("back");
            else{

              await sql.query("UPDATE receipts SET  amount=?, withdraw_req=?, ref_amt=? WHERE id=? AND user_id=?", [reducedCapital, 
                addedWithdraw, ref_amt, parseInt(receiptID), parseInt(user_id)], async (erro, result)=>{
                  if(err) return console.log("Error occured when updating users request", erro), req.flash("error", "Network Error"), res.redirect("back");
                  return req.flash("error", "Email Receipts Sent Successfuly"), res.redirect("back");
            })
            }
        })
    }


  })

  


};

exports.changePassword= async(req, res)=>{

  let {admin_id} = req.user;
  let {email, password, newPassword} = req.body;

  const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);
   await db.adminEmailValidate(email, admin_id, async (err, result)=>{
     if(err) return (req.flash("error", "Incorrect details"), res.redirect("back"))
     else{
       if(result.length > 0){
        const hash = result[0].password.toString();
        bcrypt.compare(password, hash, async function (err, response) {
            if (response === true) {
               await db.updateAdminPassword(encryptedPassword, admin_id, (err, outcome)=>{
                 err ? (req.flash("error", "Network Error"), res.redirect("back")) : (req.flash("error", "Password changed successfuly"), res.redirect("back"))
               })
            }
            else { return (req.flash("error", "Incorrect Password" ), res.redirect("back")) }
        })
       }else return (req.flash("error", "Incorrect Email"), res.redirect("back"))
     }
   });
   
}


exports.usertopup = async (req, res) => {
  let { moneyto, user_id, email }  = req.body;

  await sql.query(`select bonus from miningusers where id=?`, [user_id], async(error, ress)=>{
    
    if(error) console.log(error)
    for(var y of ress){
    if(isNaN(parseInt(y.bonus)) == true){
      await db.updateBonus(parseInt(moneyto),  parseInt(user_id), async (err, result) => {
        if(err){
          console.log(err)
          return res.redirect("back")
        }else{
          await sendBonusSms(email, moneyto, (err, bounsRes)=>{
            if(err){
              console.log(err)
              req.flash( "error", "Network Error, Try again.");
              return res.redirect("back")
            }else{
              req.flash( "error", "Users Account Top Up Successfully");
              res.redirect("back")
            }
          });
        }    
      })
    }
    else{
      var addAmt = 0;
      for(var x of ress){
        addAmt =  parseInt(x.bonus) + parseInt(moneyto)
      }
      await db.updateBonus(parseInt(addAmt),  parseInt(user_id), async (err, result) => {
        if(err){
          console.log(err)
          return res.redirect("back")
        }else{
          await sendBonusSms(email, addAmt, (err, bounsRes)=>{
            if(err){
              console.log(err)
              req.flash( "error", "Network Error, Try again.");
              return res.redirect("back")
            }else{
              req.flash( "error", "Users Account Top Up Successfully");
              res.redirect("back")
            }
          });
        }    
      })
    }
  }
  })
};


exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
};
