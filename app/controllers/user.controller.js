const db = require("../models/models");
const sql = require("../models/db.config");
const bcrypt = require("bcryptjs");
const { Register } = require("../utils/registerValidate");
const { Packages, imageParams, withdrawalDB } = require("../utils/packages");
const { sendOtp } = require("../utils/email.controller");

const {
  packagesPlans,
  validateWithdrawalRequest,
} = require("../utils/runningPlans");
const { data } = require("../models/models");
const saltRounds = 10;

exports.RegisterUser = async (req, res) => {
  let refID = req.body.ref.split("")[0];
  if (req.body.ref && !isNaN(refID) !== true) {
    req.flash("error", "Enter Valid referal ID");
    res.redirect("back");
  } else {
    const password = req.body.password;
    let adminViewPassword = req.body.password;
    const encryptedPassword = await bcrypt.hash(password, saltRounds);

    let userInfo = {
      email: req.body.email,
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: req.body.address,
      country: req.body.country,
      ref: refID,
      password: encryptedPassword,
      repeat_password: adminViewPassword,
    };

    req.body.fullname.split(" ").join("");
    let { error } = Register(req.body);
    if (error) {
      req.flash("error", error.details[0]["message"]);
      res.redirect("back");
    } else {
      await db.selectByOne(
        "miningusers",
        "email",
        userInfo.email,
        async (err, result) => {
          if (err) {
            req.flash("error", "Network Error");
            res.redirect("back");
          } else if (!Object.entries(result).length == 0) {
            req.flash("error", "Email Already Exist");
            res.redirect("back");
          } else {
            await db.insertUsers("miningusers", userInfo, (err, result) => {
              if (err) {
                // console.log(err);
                req.flash("error", "Network Error");
                res.redirect("back");
              } else {
                req.flash("success", "You can now login");
                res.redirect("/login");
              }
            });
          }
        }
      );
    }
  }
};

exports.dashboard = async (req, res) => {
  var pending = [];
  var running = [];
  var numberOfReferals = 0;
  var numberOfPaidReferals = 0;
  let { user_id } = req.user;
  var referalID;
  var linkID = user_id + "rID" + user_id;

  data(req.user.user_id, async (err, userDataInput) => {
    if (err) {
      res.render("dashboard", {
        error: req.flash("error"),
        numberOfPaidReferals,
        numberOfReferals,
        running,
        pending,
        referalID,
        runningCounter: 0,
        pendingCounter: 0,
        completedCounter: 0,
        userDataInput,
        TOTALAMT: 0,
        runningTotalAmt: 0,
        linkID,
        bonus: 0,
        total: 0,
      });
    } else {

      await db.userPackage(
        user_id,
        async (err, result, refData, numOfRef, bonusRes) => {
          if (err) {
            console.log(err);
            res.render("dashboard", {
              error: req.flash("error"),
              numberOfPaidReferals,
              numberOfReferals,
              running,
              pending,
              referalID,
              runningCounter: 0,
              pendingCounter: 0,
              completedCounter: 0,
              userDataInput,
              TOTALAMT: 0,
              runningTotalAmt: 0,
              linkID,
              bonus: 0,
              total: 0,
            });
            return;
          } else {
            for (var obj of userDataInput) {
              referalID = obj.fullname.split(" ").join("");
            }

            if (Object.entries(result).length === 0) {
              res.render("dashboard", {
                error: req.flash("error"),
                numberOfPaidReferals,
                numberOfReferals,
                running,
                pending,
                referalID,
                runningCounter: 0,
                pendingCounter: 0,
                completedCounter: 0,
                userDataInput,
                TOTALAMT: 0,
                runningTotalAmt: 0,
                linkID,
                bonus: 0,
                total: 0,
              });
            } else {
              packagesPlans(
                result,
                (
                  firstErr,
                  {
                    runningCounter,
                    pendingCounter,
                    completedCounter,
                    runningTotalAmt,
                    TOTALAMT,
                  }
                ) => {
                  if (!firstErr) {
                    res.render("dashboard", {
                      error: req.flash("error"),
                      numberOfPaidReferals,
                      numberOfReferals,
                      running,
                      pending,
                      referalID,
                      runningCounter,
                      pendingCounter,
                      completedCounter,
                      userDataInput,
                      TOTALAMT,
                      runningTotalAmt,
                      linkID,
                      bonus: bonusRes[0].bonus,
                      total:
                        parseInt(runningTotalAmt) + parseInt(bonusRes[0].bonus),
                    });
                  } else {
                    res.render("dashboard", {
                      error: req.flash("error"),
                      numberOfPaidReferals,
                      numberOfReferals,
                      running,
                      pending,
                      referalID,
                      runningCounter: 0,
                      pendingCounter: 0,
                      completedCounter: 0,
                      userDataInput,
                      TOTALAMT: 0,
                      runningTotalAmt: 0,
                      linkID,
                      bonus: 0,
                      total: 0,
                    });
                  }
                }
              );
            }
          }
        }
      );
    }
  });
};

exports.mining = async (req, res) => {
  let userDataInput;

  res.render("mining", { error: req.flash("error"), userDataInput });
};

exports.MiningPlans = (req, res) => {
  let img = "";
  let address = "";
  let userDataInput;

  // console.log(req.params.id)

  let miningCoin = req.params.id.split("$")[0];
  let miningPackage = req.params.id.split("$")[1];
  miningCoin == "Packages"
    ? ((address =
      " 1Htkw7bo6nPLE6tfw81kLKf2EbH8xXyaZ9 OR bc1qlknax3vn89yjhjtu5ywrv4d69d82rz6x7wdyc3"),
      (img = "/images/btc.jpeg"))
    : ((address = "0x38eD20fe105750EBc2a0bb8a9366f9C540857a25"),
      (img = "/images/eth.jpeg"));
  Packages[miningCoin] === undefined
    ? res.redirect("back")
    : Packages[miningCoin][miningPackage] === undefined
      ? res.redirect("back")
      : res.render("payment", {
        data: Packages[miningCoin][miningPackage],
        miningCoin,
        miningPackage,
        error: req.flash("error"),
        userDataInput,
        address,
        img,
      });
};

exports.paymemtamt = (req, res) => {
  let address = `1Htkw7bo6nPLE6tfw81kLKf2EbH8xXyaZ9      OR \n   \t   bc1qlknax3vn89yjhjtu5ywrv4d69d82rz6x7wdyc3`;
  let img = "/images/btc.jpeg";

  let userDataInput;
  let { pac, depositAmt } = req.body;
  // console.log("pac", pac)
  if (!req.body.pac || !req.body.depositAmt) {
    req.flash("error", "Enter valid amount");
    res.redirect("back");
  } else {
    res.render("finalPayment", {
      data: pac,
      depositAmt,
      error: req.flash("error"),
      userDataInput,
      address,
      img,
    });
  }
};

exports.MiningReceipts = async (req, res) => {
  let { name, mimetype, mv } = req.files.receipt;
  let { pac, depositAmount } = req.body;
  let { user_id } = req.user;
  let imagePath = "receiptImg/" + name;
  let userDataInput;

  await db.data(user_id, async (err, result) => {
    if (err) {
      console.log(err)
      req.flash("error", "DB Error");
      res.redirect("/runningPlans")
      return;
    }

    else {
      console.log("USER RESULT", result);
      var ref;
      for (var obj of result) {
        ref = parseInt(obj.ref);
      }
      console.log("REF", ref);
      if (isNaN(ref)) {
        imageParams.includes(mimetype)
          ? (mv("public/receiptImg/" + name),
            db.userReceipts(
              imagePath,
              "pending",
              pac,
              depositAmount,
              user_id,
              "",
              (err, result) => {
                err
                  ? (console.log(err),
                    req.flash("error", "network error"),
                    res.redirect("/runningPlans"))
                  : (req.flash(
                    "error",
                    "Your transaction is under review and will be updated within 24 hrs"
                  ),
                    res.redirect("/runningPlans"));
              }
            ))
          : (req.flash(
            "error",
            "kindly select valid payment receipt and try again"
          ),
            res.redirect("/runningPlans"));
      } else {
        imageParams.includes(mimetype)
          ? (mv("public/receiptImg/" + name),
            db.userReceipts(
              imagePath,
              "pending",
              pac,
              depositAmount,
              user_id,
              ref,
              (err, result) => {
                err
                  ? (console.log(err),
                    req.flash("error", "network error"),
                    res.redirect("/runningPlans"))
                  : (req.flash(
                    "error",
                    "Your transaction is under review and will be updated within 24 hrs"
                  ),
                    res.redirect("/runningPlans"));
              }
            ))
          : (req.flash(
            "error",
            "kindly select valid payment receipt and try again"
          ),
            res.redirect("/runningPlans"));
      }
    }
  });
};





exports.runningPlans = async (req, res) => {
  let userDataInput;
  await db.selectByOne(
    "receipts",
    "user_id",
    req.user.user_id,
    async (err, result) => {
      if (err) {
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        if (Object.entries(result).length === 0) {
          res.render("tables", {
            error: req.flash("error"),
            running: [],
            pending: [],
            userDataInput,
          });
        } else {
          await packagesPlans(result, (err, { running, pending }) => {
            if (!err) {
              res.render("tables", {
                error: req.flash("error"),
                running,
                pending,
                userDataInput,
              });
            } else {
              res.redirect("back");
            }
          });
        }
      }
    }
  );
};

exports.withdrawal = async (req, res) => {
  await db.userPackage(
    req.user.user_id,
    async (err, result, refData, numOfRef, bonusRes) => {
      if (err) {
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        if (Object.entries(result).length === 0) {
          res.render("withdrawal", {
            outPut: [],
            bonus: 0,
            error: req.flash("error"),
          });
        } else {
          await packagesPlans(result, (err, { running, runningTotalAmt }) => {
            if (!err) {
              var { outPut } = validateWithdrawalRequest(running);

              res.render("withdrawal", {
                outPut,
                bonus: bonusRes[0].bonus,
                error: req.flash("error"),
              });
            }
          });
        }
      }
    }
  );
};

exports.withdrawalUpdate = async (req, res) => {
  let { id, userID, roi, deposit } = req.params;
  let parsedROI = parseInt(roi);
  let parsedDeposit = parseInt(deposit);
  let profit = parsedROI - parsedDeposit;
  console.log("PROFIT GOING TO THE DETABLE", profit);

  await sql.query(
    "UPDATE receipts SET roi = ? WHERE id=? AND user_id=?",
    [profit, parseInt(id), parseInt(userID)],
    async (err, result) => {
      if (err) {
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        res.render("finalWithdraw", {
          receiptID: id,
          roi,
          profit,
          error: req.flash("error"),
          success: req.flash("success"),
        });
      }
    }
  );
};

exports.withdrawalRequest = async (req, res) => {
  console.log(req.body);
  let { wallet, roi, receiptID } = req.body;

  await sql.query(
    "SELECT roi, withdraw_req FROM receipts WHERE id=? AND user_id=?",
    [parseInt(receiptID), req.user.user_id],
    async (err, result) => {
      if (err) {
        console.log(err);
        req.flash("error", "network error");
        res.redirect("back");
      } else {
        let roiDB, withdraw_reqDB;
        for (var obj of result) {
          roiDB = parseInt(result[0].roi);
          withdraw_reqDB = parseInt(result[0].withdraw_req);
        }
        let compareRoi = roiDB - withdraw_reqDB;
        console.log("COMPARE TOTAL AMOUNT ", compareRoi);
        if (parseInt(roi) > compareRoi) {
          req.flash(
            "error",
            "Your total withdraw must be less than or equal to your return of investment (ROI)"
          );
          res.redirect("back");
        } else {
          await db.withdrawalRequest(
            wallet,
            req.user.user_id,
            roi,
            parseInt(receiptID),
            (err, result) => {
              if (err) {
                req.flash("error", "network error");
                res.redirect("back");
              } else {
                req.flash(
                  "error",
                  "Your request has been receive, it will be processed within 24hrs"
                );
                res.redirect("/withdrawal");
              }
            }
          );
        }
      }
    }
  );
};

exports.DeletePlan = (req, res) => {
  const { id } = req.params;
  db.deletePlan(id, req.user.user_id, (err, output) => {
    err
      ? (req.flash("error", "network error"), res.redirect("back"))
      : (req.flash("error", "Plan Deleted Successfully"), res.redirect("back"));
  });
};

exports.setting = (req, res) => {
  res.render("setting", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

exports.changePassword = async (req, res) => {
  let { user_id } = req.user;
  let { email, password, newPassword } = req.body;

  const encryptedPassword = await bcrypt.hash(newPassword, saltRounds);

  await db.emailPasswordValidate(email, user_id, async (err, result) => {
    if (err)
      return req.flash("error", "Incorrect details"), res.redirect("back");
    else {
      if (result.length > 0) {
        const hash = result[0].password.toString();
        bcrypt.compare(password, hash, async function (err, response) {
          if (response === true) {
            await db.updatePassword(
              encryptedPassword,
              newPassword,
              user_id,
              (err, outcome) => {
                err
                  ? (req.flash("error", "Network Error"), res.redirect("back"))
                  : (req.flash("success", "Password changed successfuly"),
                    res.redirect("back"));
              }
            );
          } else {
            return (
              req.flash("error", "Incorrect Password"), res.redirect("back")
            );
          }
        });
      } else return req.flash("error", "Incorrect Email"), res.redirect("back");
    }
  });
};

exports.contactSubmit = async (req, res) => {
  // console.log("____________________________")
  // console.log(req.body)
  await db.contact(req.body, (err, result) => {
    err
      ? (req.flash("error", "Network Error"), res.redirect("back"))
      : (req.flash("error", "Message sent successfuly"), res.redirect("back"));
  });
};

exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
};

exports.resetPassword = async (req, res) => {
  let otp;
  console.log(req.body);

  await db.forgetPassword(req.body.email, async (err, data) => {
    if (err) {
      req.flash("error", "Email does not exist");
      res.redirect("back");
    } else if (data.length == 0) {
      req.flash("error", "Email does not exist");
      res.redirect("back");
    } else {
      let { email, id } = data;
      otp = Math.round(Math.random() * 100000000);
      db.updateOtp(id, otp, async (err, result) => {
        // console.log("LINE 175 ", result)
        if (err) {
          req.flash("error", "Network Error, try again");
          res.redirect("back");
        } else {
          console.log(otp);
          await sendOtp(email, otp, (err, respoObj) => {
            if (err)
              return (
                req.flash("error", "Network Error, try again"),
                res.redirect("back")
              );
            else
              return res.render("otp", {
                id,
                error: req.flash("error"),
                success: req.flash("success"),
                isAuthenticated: req.isAuthenticated() && req.user.user_id,
              });
          });
        }
      });
    }
  });
};

exports.resetPasswordOtpCode = async (req, res) => {
  let { id, otp } = req.body;
  let parsedID = parseInt(id);
  let parsedOTP = parseInt(otp);
  console.log(req.body, "Ddd");
  db.getOtpVerifications(parsedID, (err, data) => {
    if (err) {
      req.flash("error", "Network Error, Try Again");
      res.render("otp", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    } else if (data.username == parsedOTP) {
      req.flash("success", "Enter new password");
      res.render("newPassword", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    } else {
      req.flash("error", "The OTP code you entered is Incorrect");
      res.render("otp", {
        id,
        error: req.flash("error"),
        success: req.flash("success"),
        isAuthenticated: req.isAuthenticated() && req.user.user_id,
      });
    }
  });
};

exports.newPassword = async (req, res) => {
  let hashPassword;
  let { id, password } = req.body;
  console.log(password);
  let parsedID = parseInt(id);

  if (password !== "" || ("" && id)) {
    await bcrypt.hash(password, saltRounds, function (err, hash) {
      hashPassword = hash;
      if (err) {
        req.flash("error", "Network Error");
        res.redirect("back");
      } else {
        db.resetConfirmedPassword(parsedID, hashPassword, (err, data) => {
          if (err) {
            req.flash("error", "Network Error");
            res.redirect("back");
          } else {
            req.flash("success", "Password reset successfully");
            res.redirect("/login");
          }
        });
      }
    });
  } else {
    req.flash("error", "YOUR ENTERED INVALID INPUTS");
    res.render("newPassword", {
      id,
      error: req.flash("error"),
      success: req.flash("success"),
      isAuthenticated: req.isAuthenticated() && req.user.user_id,
    });
  }
};

const RegisterAdmin = async (req, res) => {
  const password = "admin@gmail.com";
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  let userInfo = {
    email: "admin@main.com",
    fullname: "Main Admin",
    password: encryptedPassword,
    // repeat_password: encryptedPassword,
  };
  await db.createAdmin(userInfo, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Admin created");
    }
  });
};

// RegisterAdmin()
