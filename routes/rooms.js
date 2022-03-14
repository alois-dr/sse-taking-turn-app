const express = require('express');
const {check, body, query, cookie} = require("express-validator");
const RoomService = require('../utils/roomService')
const router = express.Router();

router.post('/',
  body("room-name").trim().escape(),
  body("username").trim().escape().notEmpty(),
  RoomService.createRoom
)

router.get("/:name",
  check("name").trim().escape(),
  cookie("u").isJSON().notEmpty(),
  RoomService.getRoom
)

router.post("/:name/speechs",
  check("name").trim().escape(),
  body().isJSON().contains("userId"),
  cookie("u").isJSON(),
  RoomService.newSpeech
)

router.get("/:name/speechs",
  check("name").trim().escape(),
  cookie("u").isJSON(),
  RoomService.getAllSpeechs
)

router.get("/:name/sse",
  check("name").trim().escape(),
  cookie("u").isJSON().contains("name"),
  RoomService.openSSE
)

router.get("/:name/users/:username",
  check("name").trim().escape(),
  check("username").trim().escape(),
  RoomService.getUser
)

router.put("/:name/users/:username",
  check("name").trim().escape(),
  check("username").trim().escape(),
  body().isJSON(),
  cookie().isJSON().contains('u'),
  RoomService.updateUser
)

router.delete("/:name/speechs/current",
  check("name").trim().escape(),
  cookie("u").isJSON().contains("privateId"),
  RoomService.closeCurrentSpeech
)

module.exports = router;
