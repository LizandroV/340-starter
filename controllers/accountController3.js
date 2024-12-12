const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    return res.status(201).render("account/login", {
      title: "Login",
      errors: null,
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", {
      title: "Registration",
      errors: null,
      nav,
    });
  }
}

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  res.redirect("/account/account-management");
}

/* ****************************************
 *  Process login post request
 * ************************************ */
async function accountLogin(req, res) {
  const mockAccountData = {
    account_id: 1,
    account_firstname: "Mock",
    account_lastname: "User",
    account_email: "mockuser@example.com",
  };

  utilities.updateCookie(mockAccountData, res);
  return res.redirect("/account/account-management");
}

/* ****************************************
 *  Process account management get request
 * *************************************** */
async function buildAccountManagementView(req, res) {
  let nav = await utilities.getNav();
  const unread = await messageModel.getMessageCountById(1); // Mocked account ID

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    unread,
  });
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  delete res.locals.accountData;
  res.locals.loggedin = 0;
  req.flash("notice", "Logout successful.");
  res.redirect("/");
}

/* ****************************************
 *  Deliver account update view get
 * *************************************** */
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav();

  const accountDetails = {
    account_id: 1,
    account_firstname: "Mock",
    account_lastname: "User",
    account_email: "mockuser@example.com",
  };

  res.render("account/update", {
    title: "Update",
    nav,
    errors: null,
    ...accountDetails,
  });
}

/* ****************************************
 *  Process account update post
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email } = req.body;

  req.flash(
    "notice",
    `Congratulations, you've updated ${account_firstname}.`
  );

  res.status(201).render("account/account-management", {
    title: "Management",
    errors: null,
    nav,
  });
}

/* ****************************************
 *  Process account password update post
 * *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();

  req.flash("notice", "Password update is mocked and always succeeds.");
  res.status(201).render("account/account-management", {
    title: "Manage",
    errors: null,
    nav,
  });
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagementView,
  accountLogout,
  buildUpdate,
  updateAccount,
  updatePassword,
};
