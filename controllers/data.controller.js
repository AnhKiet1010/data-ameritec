const Activations = require("../models/activation.model");
const User = require('../models/user.model');
const UserMeta = require('../models/usermeta.model');
const UserInfo = require('../models/userinfo.model');
const Tree = require('../models/tree.model');
const Transaction = require("../models/transaction.model");
const Commission = require("../models/commission.model");
const Policy = require("../models/policy.model");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const STEP1_NUMBER = 9;
const STEP2_NUMBER = 90;
const STEP3_NUMBER = 819;
const STEP4_NUMBER = 7390;
const STEP5_NUMBER = 897216347;
const STEP6_NUMBER = 34721634891746;

exports.convertUser = async (req, res) => {
  // LOAD ALL USER IN OLD DATA
  const list = await UserInfo.find().exec();
  const result = [];
  for (let info of list) {
    let email = info.user_email;
    let name = info.display_name;
    if (!email.includes('@ameritecjsc.com')) {
      if (email.substr(0, 1) == "1" || email.substr(0, 1) == "2" || email.substr(0, 1) == "3") {
        let compareEmail = email.substr(1).trim();
        let repeatEmail = await UserInfo.findOne({ $and: [{ user_email: compareEmail }, { oldid: { $ne: info.oldid } }] }).exec();
        if (!repeatEmail) {
          if (name.substr(-1) == "1" || name.substr(-1) == "2" || name.substr(-1) == "3") {
            let compareName = name.substr(0, name.length - 1).trim();
            let mainUser = await UserInfo.findOne({ $and: [{ display_name: compareName }, { oldid: { $ne: info.oldid } }] }).exec();
            if (!mainUser) {
              result.push(info);
            }
          } else {
            result.push(info);
          }
        }
      } else {
        if (name.substr(-1) == "1" || name.substr(-1) == "2" || name.substr(-1) == "3") {
          let compareName = name.substr(0, name.length - 1).trim();
          let mainUser = await UserInfo.findOne({ $and: [{ display_name: compareName }, { oldid: { $ne: info.oldid } }] }).exec();
          if (!mainUser) {
            result.push(info);
          }
        } else {
          result.push(info);
        }
      }
    }
  }
  // console.log("result", result);

  for (let info of result) {
    await saveUser(info);
  }

  // res.send(list);
  res.send('converted user........');
};

const saveUser = async (info) => {
  let element = await UserMeta.find({ user_id: info.oldid }).exec();

  // AVATAR
  let listCharacterOfName = info.display_name.split(" ");
  let avatarKey = listCharacterOfName.length >= 2
    ? `${listCharacterOfName[listCharacterOfName.length - 2]}+${listCharacterOfName[listCharacterOfName.length - 1]}`
    : listCharacterOfName[0].substr(0, 1);

  // OLD ID CHILDS
  let childs = await UserInfo.find({ display_name: { $regex: '.*' + info.display_name + '.*' } }).exec();
  if (childs) {
    var arrIdChild = childs.map((child) => child.oldid);
  }

  // BUY PACKAGE
  let email = info.user_email;
  let index = email.indexOf("@");
  let emailName = email.substr(0, index);
  let listEmailLike = await UserInfo.find({ $and: [{ oldid: { $ne: info.oldid } }, { user_email: { $regex: '.*' + emailName + '.*' } }] });
  if (listEmailLike.length >= 3) {
    var buy_package = "2";
  } else {
    var buy_package = "1";
  }

  for (let ele of element) {
    // MA GIOI THIEU (PARENT ID)
    if (ele.meta_key == "cap_tren") {
      var parentOldId = ele.meta_value;

      // GROUP NUMBER
      var captren = await UserInfo.findOne({ oldid: parentOldId }).exec();
      if (captren) {
        if (captren.display_name.substr(-1) == "1") {
          var groupNumber = "1";
        } else if (captren.display_name.substr(-1) == "2") {
          var groupNumber = "2";
        } else if (captren.display_name.substr(-1) == "3") {
          var groupNumber = "3";
        }
      }
    }
    // SO DIEN THOAI
    if (ele.meta_key == "so_dien_thoai") { var phone = ele.meta_value; }
    // GIOI TINH
    if (ele.meta_key == "gioi_tinh") {
      var gender = 1;
      if (ele.meta_value == 'M') {
        gender = 2;
      }
      if (ele.meta_value == 'F') {
        gender = 3;
      }
    }
    // NGAY SINH
    if (ele.meta_key == "ngay_thang_nam_sinh") { var birthday = ele.meta_value }
    // SO CMND
    if (ele.meta_key == "so_cmnd") { var id_code = ele.meta_value; }
    // NGAY CAP
    if (ele.meta_key == "ngay_cap_cmnd") { var id_time = ele.meta_value }
    // NOI CAP
    if (ele.meta_key == "noi_cap_cmnd") { var issued_by = ele.meta_value; }
    // SO TAI KHOAN
    if (ele.meta_key == "tai_khoan_ngan_hang") { var bank_account = ele.meta_value; }
    // NGAN HANG
    if (ele.meta_key == "ngan_hang") { var bank = ele.meta_value; }
    // CHU TAI KHOAN
    if (ele.meta_key == "ten_chu_the") { var bank_name = ele.meta_value; }
    // MA SO THUE
    if (ele.meta_key == "ma_so_thue") { var tax_code = ele.meta_value; }
  };

  let user = new User({
    old_id_childs: arrIdChild ? arrIdChild : [],
    oldid: info.oldid,
    full_name: info.display_name,
    gender,
    birthday: birthday ? birthday : "",
    phone: phone ? phone : "",
    email: info.user_email,
    password: "$2b$10$3HpEWjLCqQ97bg7cIuPP/OMOyr5kkzQ7zxZTczdXJH2STQPYwiA0m",
    avatar: `https://ui-avatars.com/api/?name=${avatarKey}&background=random`,
    role: "normal",
    created_time: info.user_registered,
    buy_package,
    parentOldId: parentOldId ? parentOldId : "AMERITEC2021",
    parentId: "",
    groupNumber: groupNumber ? groupNumber : "unknow",
    id_code: id_code ? id_code : "",
    id_time: id_time ? id_time : "",
    issued_by: issued_by ? issued_by : "",
    bank_account: bank_account ? bank_account : "",
    bank: bank ? bank : "",
    bank_name: bank_name ? bank_name : "",
    tax_code: tax_code ? tax_code : "",
    expired: info.user_email.includes("EP") ? true : false,
    cmndMT: "",
    cmndMS: "",
  });

  await user.save((err) => {
    if (err) {
      console.log('err', err);
    }
  });
}

exports.updateNewParentId = async (req, res) => {

  var listUser = await User.find().limit().exec();

  for (let user of listUser) {
    let parent = await User.findOne({ old_id_childs: { $in: [user.parentOldId] } }).exec();

    if (parent) {
      await User.findOneAndUpdate({ _id: user._id }, { parentId: parent._id }).exec();
    } else {
      await User.findOneAndUpdate({ _id: user._id }, { parentId: "AMERITEC2021" }).exec();
    }
  }

  // res.send(listUser);
  res.send("Updated New Parent ID");
}

exports.saveTree = async (req, res) => {
  const list = await User.find().exec();

  for (let user of list) {

    let tree = new Tree({
      oldid: user.oldid,
      parent: user._id,
      group1: [],
      group2: [],
      group3: [],
      buy_package: user.buy_package
    });

    await tree.save(async (err) => {
      if (err) {
        console.log('err', err);
      }
    });
  }
  res.send('saved tree');
}

exports.convertTree = async (req, res) => {
  const list = await User.find().exec();

  for (let user of list) {
    let groupNumber = user.groupNumber;
    let parentOldId = user.parentOldId;

    if (parentOldId && parentOldId !== "AMERITEC2021") {
      await insertIdToGroupOfTree(user._id, parentOldId, groupNumber);
    }
  }

  res.send("converted");
}

const insertIdToGroupOfTree = async (id, parentOldId, groupNumber) => {
  let mainParent = await User.findOne({ old_id_childs: { $in: [parentOldId] } }).exec();

  if (mainParent) {
    var parentTree = await Tree.findOne({ oldid: mainParent.oldid }).exec();
  }

  if (parentTree) {

    if (groupNumber == "1" || groupNumber == "unknow") {
      let group1 = [...parentTree.group1, id];
      await Tree.findOneAndUpdate({ oldid: mainParent.oldid }, { group1: [...group1] }).exec();
    }

    if (groupNumber == "2") {
      let group2 = [...parentTree.group2, id];
      await Tree.findOneAndUpdate({ oldid: mainParent.oldid }, { group2: [...group2] }).exec();
    }

    if (groupNumber == "3") {
      let group3 = [...parentTree.group3, id];
      await Tree.findOneAndUpdate({ oldid: mainParent.oldid }, { group3: [...group3] }).exec();
    }

  }

}

exports.something = async (req, res,) => {

  var listUser = await User.find({ oldid: "5948" }).exec();

  for (let user of listUser) {
    let amount = 0;
    let point = 0;

    await User.countDocuments({ parentId: user._id, buy_package: "2" }, function (err, c) {
      amount += c * 160;
      point += c * 1;
    });

    await User.countDocuments({ parentId: user._id, buy_package: "1" }, function (err, c) {
      amount += c * 40;
      point += c * 0.25;
    });

    await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(user._id) }, { amount: amount, point: point }).exec();
  };

  res.send("Updated Amount + Point");
};

const checkLevel = async (id) => {

  if (id) {
    var user = await User.findOne({ _id: id }).exec();
  }
  else {
    return 0;
  }
  if (!user) {
    return 0;
  }

  let lv = parseInt(user.level);
  let flag = false;
  console.log(lv);
  switch (lv) {
    case 0:
      await User.countDocuments({ parentId: id }, async function (err, c) {
        if (c >= 9) {
          await User.findOneAndUpdate({ _id: user._id }, { level: 1 }).exec();
          flag = true;
        }
      });

      break;
    case 1:
      await User.countDocuments({ parentId: id, level: 1 }, async function (err, c) {
        if (c >= 9) {
          await User.findOneAndUpdate({ _id: user._id }, { level: 2 }).exec();
          flag = true;
        }
      });

      break;
    case 2:
      await User.countDocuments({ parentId: id, level: 2 }, async function (err, c) {
        if (c >= 9) {
          await User.findOneAndUpdate({ _id: user._id }, { level: 3 }).exec();
          flag = true;
        }
      });
      break;
    case 3:
      await User.countDocuments({ parentId: _id, level: 3 }, async function (err, c) {
        if (c >= 9) {
          await User.findOneAndUpdate({ _id: user._id }, { level: 4 }).exec();
          flag = true;
        }
      });
      break;
    default:
      break;
  }
  await User.countDocuments({ parentId: id }, async function (err, c) {
    if (c < 9) {
      await User.findOneAndUpdate({ _id: user._id }, { level: 0 }).exec();
      flag = true;
    }
  });
  if (flag) {
    await checkLevel(user._id);
    await checkLevel(user.parentId);
  }
  return 0;
}

exports.createUserManual = async (req, res,) => {
  const {
    full_name,
    email,
    password,
    confirm_password,
    oldid,
    phone,
    parentOldId,
    parentId,
    groupNumber,
    created_time,
    id_code,
    id_time,
    issued_by,
    bank_account,
    bank,
    bank_name,
    tax_code,
    birthday,
    expired,
    cmndMT,
    cmndMS,
    buy_package,
    gender,
  } = req.body;
  if (password != confirm_password) {
    res.json({
      status: 204,
      message:
        "Password và Confirm Password không trùng khớp!",
      errors: [],
    });
    return res;
  }
  let userOld = await User.find({ $or: [{ email: email }, { oldid: oldid }] }).exec();
  if (userOld.length > 0) {
    console.log(userOld);
    res.json({
      status: 204,
      message:
        "email hoặc oldid đã tồn tại!",
      errors: [],
    });
    return res;
  }
  bcrypt.genSalt(saltRounds, async function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {

      // --------------- CREATE AVATAR -------------------
      const listCharacterOfName = full_name.split(" ");
      const avatarKey = `${listCharacterOfName[listCharacterOfName.length - 2]}+${listCharacterOfName[listCharacterOfName.length - 1]}`;


      // --------------- SAVE USER -------------------
      const user = new User({
        full_name,
        email,
        password: hash,
        avatar: `https://ui-avatars.com/api/?name=${avatarKey}&background=random`,
        oldid,
        birthday,
        parentOldId,
        parentId,
        phone,
        groupNumber,
        created_time,
        id_code,
        id_time,
        issued_by,
        bank_account,
        bank,
        bank_name,
        tax_code,
        expired,
        cmndMT,
        cmndMS,
        buy_package,
        gender,
      });
      user.save(async function (err) {
        if (err) {
          console.log(err);
          res.json({
            status: 204,
            message:
              "Save user không thành công!",
            errors: [],
          });
          return res;
        }
        else {
          const tree = new Tree({
            oldid,
            parent: user._id,
            buy_package,
            group1: [],
            group2: [],
            group3: [],
          });
          await tree.save(async function (err) {
            if (err) {
              console.log(err);
              res.json({
                status: 204,
                message:
                  "Save tree của user không thành công!",
                errors: [],
              });
              return res;
            }
            else {
              res.json({
                status: 200,
                message: user,
                errors: [],
              });
              return res;
            }
          });
          if (user.buy_package == "3") {
            await createCloneBuyPackage3(user);
          }
        }
      });
    });
  });
};

exports.deleteUserManual = async (req, res) => {
  const {
    id
  } = req.body;
  var user = await User.findOne({ _id: id }).exec();
  if (user.buy_package == "3") {
    var users_clone = await User.find({ email: user.email }).exec();
    for (var user_clone of users_clone) {
      await deleteUserAndTree(user_clone._id);
    }
  }
  User.updateMany({ parentId: id }, { parentId: "" }).exec();
  var trees = await Tree.find({}).exec();
  for (var element of trees) {
    if (element.group1.includes(id)) {
      var group1 = [...element.group1];
      const index = group1.indexOf(id);
      if (index > -1) {
        group1.splice(index, 1);
      }
      element.group1 = group1;
    }
    if (element.group2.includes(id)) {
      var group2 = [...element.group2];
      const index = group2.indexOf(id);
      if (index > -1) {
        group2.splice(index, 1);
      }
      element.group2 = group2;
    }
    if (element.group3.includes(id)) {
      var group3 = [...element.group3];
      const index = group3.indexOf(id);
      if (index > -1) {
        group3.splice(index, 1);
      }
      element.group3 = group3;
    }
    await element.save()
  }
  await deleteUserAndTree(id);
  res.json({
    status: 204,
    message:
      "Success",
    errors: [],
  });
  return res;
}
const deleteUserAndTree = async (id) => {
  await User.deleteOne({ _id: id }).exec();
  await Tree.deleteOne({ parent: id }).exec();
}
const createCloneBuyPackage3 = async (user) => {
  var tree_parent = await Tree.findOne({ $or: [{ parent: user._id }, { oldid: user.oldid }] }).exec();
  var group1 = [];
  var group2 = [];
  var group3 = [];
  for (var i = 1; i <= 9; i++) {
    const user_new = new User({
      full_name: user.full_name + " " + i,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      oldid: user.oldid,
      birthday: user.birthday,
      parentOldId: user.parentOldId,
      parentId: user._id,
      phone: user.phone,
      groupNumber: user.groupNumber,
      created_time: user.created_time,
      id_code: user.id_code,
      id_time: user.id_time,
      issued_by: user.issued_by,
      bank_account: user.bank_account,
      bank: user.bank,
      bank_name: user.bank_name,
      tax_code: user.tax_code,
      expired: user.expired,
      cmndMT: user.cmndMT,
      cmndMS: user.cmndMS,
      buy_package: "2",
      gender: user.gender,
      isClone: true
    });
    await user_new.save();
    const tree = new Tree({
      oldid: user_new.oldid,
      parent: user_new._id,
      buy_package: 3,
      group1: [],
      group2: [],
      group3: [],
    });
    await tree.save();
    switch (i) {
      case 1:
      case 2:
      case 3:
        group1.push(user_new._id.toString());
        break;
      case 4:
      case 5:
      case 6:
        group2.push(user_new._id.toString());
        break;
      case 7:
      case 8:
      case 9:
        group3.push(user_new._id.toString());
        break;
    }

  }
  tree_parent.group1 = group1;
  tree_parent.group2 = group2;
  tree_parent.group3 = group3;
  await tree_parent.save();
}