window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ActionControl: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5639ahMai9D17cH0F2qCGew", "ActionControl");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        num: {
          default: 0,
          type: cc.Integer,
          range: [ 0, 10 ],
          notify: function notify() {
            var lab = this.node.getChildByName("num").getComponent(cc.Label);
            lab.string = this.num;
            var shadow = this.node.getChildByName("shadow");
            shadow.active = 0 == this.num;
          }
        },
        show: {
          default: false,
          type: cc.Boolean,
          notify: function notify() {
            var lab = this.node.getChildByName("num");
            lab.active = this.show;
          }
        },
        spriteFrames: {
          default: [],
          type: [ cc.SpriteFrame ]
        },
        index: {
          default: 1,
          type: cc.Integer,
          range: [ 0, 5 ],
          notify: function notify() {
            var sp = this.node.getComponent(cc.Sprite);
            sp.spriteFrame = this.spriteFrames[this.index];
          }
        }
      },
      init: function init(index, num) {
        this.index = index;
        var sp = this.node.getComponent(cc.Sprite);
        sp.spriteFrame = this.spriteFrames[index];
        var lab = this.node.getChildByName("num").getComponent(cc.Label);
        lab.string = num;
        var shadow = this.node.getChildByName("shadow");
        shadow.active = 0 == num;
      },
      showNum: function showNum(num, bShow) {
        var lab = this.node.getChildByName("num");
        lab.getComponent(cc.Label).string = num;
        lab.active = bShow;
      },
      getIndex: function getIndex() {
        return this.index;
      }
    });
    cc._RF.pop();
  }, {} ],
  Game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72457xjAX1GAYQ1YxlJ0Zxs", "Game");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        canvas: {
          default: null,
          type: cc.Node
        },
        action: {
          default: null,
          type: cc.Prefab
        },
        roadH: {
          default: null,
          type: cc.Prefab
        },
        roadHEnd: {
          default: null,
          type: cc.Prefab
        },
        roadTurn: {
          default: null,
          type: cc.Prefab
        },
        roadCross: {
          default: null,
          type: cc.Prefab
        },
        smoke: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        var back = this.node.getChildByName("back");
        back.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
        var restart = this.node.getChildByName("restart");
        restart.on(cc.Node.EventType.TOUCH_END, this.restart, this);
        this.car = this.node.getChildByName("car");
        this.car.on(cc.Node.EventType.TOUCH_END, this.run, this);
        this.car.zIndex = 2;
        var actionArea = this.node.getChildByName("action");
        actionArea.zIndex = 4;
        actionArea.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        actionArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        actionArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        actionArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        var start = actionArea.getChildByName("start");
        var down = actionArea.getChildByName("down");
        var left = actionArea.getChildByName("left");
        var right = actionArea.getChildByName("right");
        var up = actionArea.getChildByName("up");
        var circle = actionArea.getChildByName("circle");
        this.actionCtl = [ start, down, left, right, up, circle ];
        this.endLine = this.node.getChildByName("end_line");
        this.endLine.zIndex = 3;
      },
      start: function start() {
        this.carNum = 3;
        this.roads = [];
        this.actionBtnNums = [ 0, 0, 0, 0, 0, 0 ];
        this.actionIndex = -1;
        this.actionBtns = [ [], [], [], [], [], [] ];
        this.currMoveAction = null;
        this.targetActionCtl = [];
        this.targetActionBtns = [];
        this.smokeParticle = this.smoke.getComponent(cc.ParticleSystem);
        this.setTargetActionCtl();
        this.readLevelConfig();
        this.resetTargetActionCtl();
        this.addActionBtns();
        this.loadMap();
      },
      addActionBtns: function addActionBtns() {
        console.log("===>>>actionBtnNums", this.actionBtnNums);
        for (var i = 0; i < this.actionBtnNums.length; ++i) {
          for (var j = 0; j < this.actionBtnNums[i] + 1; ++j) {
            var action = cc.instantiate(this.action);
            action.parent = this.actionCtl[i];
            action.setPosition(0, 0);
            var actionControl = action.getComponent("ActionControl");
            actionControl.init(i, j);
            actionControl.showNum(j, 0 != i);
            this.actionBtns[i].push(action);
          }
          console.log("===>>>actionBtns.length=%d", this.actionBtns[i].length);
        }
      },
      setTargetActionCtl: function setTargetActionCtl() {
        var start = this.node.getChildByName("control_key");
        this.targetActionCtl.push(start);
        start.on(cc.Node.EventType.TOUCH_START, this.onTouchTargetActionStart, this);
        start.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        start.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        start.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        for (var i = 1; i < 6; ++i) {
          var control = this.node.getChildByName("control_" + i);
          this.targetActionCtl.push(control);
          control.on(cc.Node.EventType.TOUCH_START, this.onTouchTargetActionStart, this);
          control.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          control.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
          control.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }
      },
      resetTargetActionCtl: function resetTargetActionCtl() {
        for (var i = 1; i < 6; ++i) {
          var control = this.node.getChildByName("control_" + i);
          i < this.totalControlBtnNums ? control.active = true : control.active = false;
        }
      },
      loadMap: function loadMap() {
        var levelNum = this.node.getChildByName("level_num").getComponent(cc.Label);
        levelNum.string = LevelData.getLevelID() + 1;
        this.refreshCarNum();
        var carInfo = this.getCarPos();
        this.car.setPosition(carInfo.carPos);
        this.car.angle = carInfo.angle;
        var currPos = cc.v2(0, 0);
        currPos.x = this.levelInfo.startPos.x;
        currPos.y = this.levelInfo.startPos.y;
        var block = null;
        var lastStartPos = cc.v2(0, 0);
        lastStartPos.x = carInfo.carPos.x;
        lastStartPos.y = carInfo.carPos.y;
        for (var i = 0; i < this.blocks.length; ++i) {
          block = this.blocks[i];
          console.log("===>>>block[%d]=", i, block);
          var res = this.getResByType(block.blockType);
          for (var j = 0; j < block.num; ++j) {
            var road = cc.instantiate(res.res);
            road.parent = this.canvas;
            road.angle = res.rotation;
            road.setPosition(currPos);
            currPos.x += res.addPos.x;
            currPos.y += res.addPos.y;
            this.roads.push(road);
          }
          var distance = lastStartPos.sub(currPos).mag();
          this.levelInfo.actionDetails.push(LevelData.getAction(block, currPos, distance));
          lastStartPos.x = currPos.x;
          lastStartPos.y = currPos.y;
        }
        this.endLine.setPosition(currPos);
        block.blockType == BlockType.Up_V || block.blockType == BlockType.Down_V ? this.endLine.angle = -90 : this.endLine.angle = 0;
      },
      onTouchStart: function onTouchStart(event) {
        this.actionIndex = -1;
        for (var i = 0; i < this.actionCtl.length; ++i) if (this.actionCtl[i].getBoundingBoxToWorld().contains(event.getLocation())) {
          var actionLen = this.actionBtns[i].length;
          console.log("===>>>actionLen=%d", actionLen);
          if (actionLen <= 1) break;
          this.actionIndex = i;
          this.currMoveAction = this.actionBtns[i][actionLen - 1];
          this.showActionNum(this.currMoveAction, false);
          break;
        }
        this._lastTouchPos = null;
      },
      onTouchMove: function onTouchMove(event) {
        if (-1 == this.actionIndex) return;
        if (this.actionIndex > Control.CIRCLE) return;
        this._lastTouchPos || (this._lastTouchPos = this.canvas.convertToNodeSpaceAR(event.getStartLocation()));
        var currTouchPos = this.canvas.convertToNodeSpaceAR(event.getLocation());
        var movePos = currTouchPos.sub(this._lastTouchPos);
        this.currMoveAction.x = this.currMoveAction.x + movePos.x;
        this.currMoveAction.y = this.currMoveAction.y + movePos.y;
        this._lastTouchPos = currTouchPos;
      },
      onTouchEnd: function onTouchEnd() {
        this.onActionBtnMoveEnd();
      },
      onTouchCancel: function onTouchCancel() {
        this.onActionBtnMoveEnd();
      },
      onTouchTargetActionStart: function onTouchTargetActionStart(event) {
        this.actionIndex = -1;
        for (var i = 0; i < this.totalControlBtnNums; ++i) if (this.targetActionCtl[i] === event.target) {
          var action = this.targetActionBtns[i];
          if (!action) break;
          this.actionIndex = this.getActionIndex(action);
          this.currMoveAction = action;
          this.targetActionBtns[i] = null;
          this.actionBtns[this.actionIndex].push(action);
          this.currMoveAction.parent = this.actionCtl[this.actionIndex];
          var worldPos = this.canvas.convertToWorldSpaceAR(this.targetActionCtl[i].getPosition());
          this.currMoveAction.setPosition(this.actionCtl[this.actionIndex].convertToNodeSpaceAR(worldPos));
          break;
        }
        this._lastTouchPos = null;
      },
      onActionBtnMoveEnd: function onActionBtnMoveEnd(endPos) {
        var _this = this;
        if (-1 == this.actionIndex) return;
        if (this.actionIndex > Control.CIRCLE) return;
        var actionBtnCenter = this.currMoveAction.getBoundingBoxToWorld().center;
        var bSuccess = false;
        for (var i = 0; i < this.totalControlBtnNums; ++i) if (this.targetActionCtl[i].getBoundingBoxToWorld().contains(actionBtnCenter)) {
          bSuccess = true;
          this.targetActionBtns[i] && function() {
            var action = _this.targetActionBtns[i];
            var tempActionIndex = _this.getActionIndex(action);
            action.parent = _this.actionCtl[tempActionIndex];
            var worldPos = _this.canvas.convertToWorldSpaceAR(_this.targetActionCtl[i].getPosition());
            action.setPosition(_this.actionCtl[tempActionIndex].convertToNodeSpaceAR(worldPos));
            var self = _this;
            var move = cc.moveTo(.3, cc.v2(0, 0));
            var moveEnd = cc.callFunc(function() {
              self.showActionNum(action, 0 != tempActionIndex);
            }, _this);
            _this.actionBtns[tempActionIndex].push(action);
            action.runAction(cc.sequence(move, moveEnd));
          }();
          this.currMoveAction.parent = this.targetActionCtl[i];
          this.currMoveAction.setPosition(0, 0);
          this.actionBtns[this.actionIndex].pop();
          this.targetActionBtns[i] = this.currMoveAction;
          this.actionBtnNums[this.actionIndex]--;
          break;
        }
        if (!bSuccess) {
          var self = this;
          var move = cc.moveTo(.3, cc.v2(0, 0));
          var moveEnd = cc.callFunc(function() {
            self.showActionNum(self.currMoveAction, 0 != self.actionIndex);
          }, this);
          this.currMoveAction.runAction(cc.sequence(move, moveEnd));
        }
      },
      run: function run() {
        var firstAction = this.targetActionBtns[0];
        if (!firstAction) return;
        var actionIndex = this.getActionIndex(firstAction);
        if (actionIndex != Control.Start) return;
        this.car.off(cc.Node.EventType.TOUCH_END, this.run, this);
        var wrongIndex = -1;
        var rightOrder = this.levelInfo.rightOrder;
        var moveEndCallBack = [];
        for (var i = 1; i < rightOrder.length; ++i) if (rightOrder[i] != this.getActionIndex(this.targetActionBtns[i])) {
          wrongIndex = i;
          break;
        }
        console.log("===>>>wrongIndex=%d", wrongIndex);
        var self = this;
        var _loop = function _loop(_i) {
          var index = _i;
          moveEndCallBack[_i] = cc.callFunc(function() {
            if (index == wrongIndex - 1) {
              console.log("===>>>is wrong");
              self.car.stopAllActions();
              if (self.carNum > 0) {
                self.carNum--;
                self.refreshCarNum();
                self.lose();
              }
            } else console.log("===>>>is correct,index=%d", index);
          });
        };
        for (var _i = 0; _i < rightOrder.length; ++_i) _loop(_i);
        var actionArray = [];
        var actionDetails = this.levelInfo.actionDetails;
        for (var _i2 = 0; _i2 < rightOrder.length; ++_i2) {
          actionArray.push(actionDetails[2 * _i2 + 0]);
          if (_i2 == wrongIndex - 1) {
            var wrongAction = self.getWrongAction(wrongIndex);
            actionArray.push(wrongAction);
          } else _i2 != rightOrder.length - 1 && actionArray.push(actionDetails[2 * _i2 + 1]);
          actionArray.push(moveEndCallBack[_i2]);
        }
        var end = cc.callFunc(function() {
          var maxLevelID = LevelData.getMaxLevelID();
          var currLevelID = LevelData.getLevelID();
          currLevelID == maxLevelID && LevelData.setMaxLevelID(maxLevelID + 1);
          LevelData.saveLevelScore(self.carNum);
          self.win();
        });
        actionArray.push(end);
        this.car.runAction(cc.sequence(actionArray));
      },
      restart: function restart() {
        this.car.on(cc.Node.EventType.TOUCH_END, this.run, this);
        var carInfo = this.getCarPos();
        this.car.setPosition(carInfo.carPos);
        this.car.angle = carInfo.angle;
        this.smokeParticle.resetSystem();
        for (var i = 0; i < this.actionBtns.length; ++i) for (var j = 0; j < this.actionBtns[i].length; ++j) this.actionBtns[i][j].destroy();
        for (var _i3 = 0; _i3 < this.targetActionBtns.length; ++_i3) this.targetActionBtns[_i3] && this.targetActionBtns[_i3].destroy();
        this.actionIndex = -1;
        this.actionBtns = [ [], [], [], [], [], [] ];
        this.currMoveAction = null;
        this.targetActionBtns = [];
        this.initActionBtnNums();
        this.addActionBtns();
        this.carNum = 3;
        this.refreshCarNum();
      },
      onBack: function onBack() {
        cc.director.loadScene("LevelSelectScene");
      },
      readLevelConfig: function readLevelConfig() {
        this.levelInfo = LevelData.getLevelInfoById();
        this.totalControlBtnNums = 0;
        for (var i = 0; i < this.actionBtnNums.length; ++i) {
          this.actionBtnNums[i] = this.levelInfo.actions[i];
          this.totalControlBtnNums += this.levelInfo.actions[i];
        }
        this.blocks = this.levelInfo.blocks;
      },
      initActionBtnNums: function initActionBtnNums() {
        for (var i = 0; i < this.actionBtnNums.length; ++i) this.actionBtnNums[i] = this.levelInfo.actions[i];
      },
      showActionNum: function showActionNum(action, bShow) {
        var actionControl = action.getComponent("ActionControl");
        var actionIndex = this.getActionIndex(action);
        actionControl.showNum(this.actionBtns[actionIndex].length - 1, bShow);
      },
      getActionIndex: function getActionIndex(action) {
        if (!action) return -1;
        var actionControl = action.getComponent("ActionControl");
        return actionControl.getIndex();
      },
      getResByType: function getResByType(type) {
        var res = null;
        var rotation = 0;
        var addPos = null;
        if (type == BlockType.Right_H) {
          res = this.roadH;
          rotation = 0;
          addPos = cc.v2(90, 0);
        } else if (type == BlockType.Left_H) {
          res = this.roadH;
          rotation = 0;
          addPos = cc.v2(-90, 0);
        } else if (type == BlockType.Up_V) {
          res = this.roadH;
          rotation = 90;
          addPos = cc.v2(0, 90);
        } else if (type == BlockType.Down_V) {
          res = this.roadH;
          rotation = 90;
          addPos = cc.v2(0, -90);
        } else if (type == BlockType.Right_Up) {
          res = this.roadTurn;
          rotation = 0;
          addPos = cc.v2(0, 90);
        } else if (type == BlockType.Right_Down) {
          res = this.roadTurn;
          rotation = 90;
          addPos = cc.v2(0, -90);
        } else if (type == BlockType.Left_Up) {
          res = this.roadTurn;
          rotation = -90;
          addPos = cc.v2(0, 90);
        } else if (type == BlockType.Left_Down) {
          res = this.roadTurn;
          rotation = 180;
          addPos = cc.v2(0, -90);
        } else if (type == BlockType.Up_Right) {
          res = this.roadTurn;
          rotation = 180;
          addPos = cc.v2(90, 0);
        } else if (type == BlockType.Up_Left) {
          res = this.roadTurn;
          rotation = 90;
          addPos = cc.v2(-90, 0);
        } else if (type == BlockType.Down_Right) {
          res = this.roadTurn;
          rotation = -90;
          addPos = cc.v2(90, 0);
        } else if (type == BlockType.Down_Left) {
          res = this.roadTurn;
          rotation = 0;
          addPos = cc.v2(-90, 0);
        }
        return {
          res: res,
          rotation: rotation,
          addPos: addPos
        };
      },
      getCarPos: function getCarPos() {
        var carPos = cc.v2(0, 0);
        carPos.x = this.levelInfo.startPos.x;
        carPos.y = this.levelInfo.startPos.y;
        var angle = 0;
        var firstBlock = this.levelInfo.blocks[0];
        var firstBlockType = firstBlock.blockType;
        switch (firstBlockType) {
         case BlockType.Right_H:
          carPos.x -= 120;
          angle = 0;
          break;

         case BlockType.Left_H:
          carPos.x += 120;
          angle = 180;
          break;

         case BlockType.Up_V:
          carPos.y -= 120;
          angle = 90;
          break;

         case BlockType.Down_V:
          carPos.y += 120;
          angle = -90;
        }
        return {
          carPos: carPos,
          angle: angle
        };
      },
      win: function win() {
        var self = this;
        self.smokeParticle.stopSystem();
        var delay = cc.delayTime(2);
        var next = cc.callFunc(function() {
          var levelNum = LevelData.getLevelNum();
          var levelID = LevelData.getLevelID();
          if (levelID == levelNum - 1) {
            self.onBack();
            return;
          }
          LevelData.setLevelID(levelID + 1);
          for (var i = 0; i < self.roads.length; ++i) self.roads[i].destroy();
          self.readLevelConfig();
          self.resetTargetActionCtl();
          self.restart();
          self.loadMap();
        });
        self.car.runAction(cc.sequence(delay, next));
      },
      lose: function lose() {
        var self = this;
        self.smokeParticle.stopSystem();
        var delay = cc.delayTime(2);
        var reset = cc.callFunc(function() {
          if (0 == self.carNum) {
            self.onBack();
            return;
          }
          self.car.on(cc.Node.EventType.TOUCH_END, self.run, self);
          var carInfo = self.getCarPos();
          self.car.setPosition(carInfo.carPos);
          self.car.angle = carInfo.angle;
        });
        self.car.runAction(cc.sequence(delay, reset));
      },
      refreshCarNum: function refreshCarNum() {
        var carNum = this.node.getChildByName("car_num").getComponent(cc.Label);
        carNum.string = this.carNum;
      },
      getWrongAction: function getWrongAction(wrongIndex) {
        var wrongAction = cc.delayTime(.1);
        var lastAction = this.targetActionBtns[wrongIndex - 1];
        if (!lastAction) return wrongAction;
        var currAction = this.targetActionBtns[wrongIndex];
        if (!currAction) return wrongAction;
        var lastControl = this.getControlByAction(lastAction);
        var currControl = this.getControlByAction(currAction);
        lastControl == Control.Right ? wrongAction = currControl == Control.Up ? cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, 90) : cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, -90) : lastControl == Control.Left ? wrongAction = currControl == Control.Up ? cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, -90) : cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, 90) : lastControl == Control.Up ? wrongAction = currControl == Control.Right ? cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, -90) : cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, 90) : lastControl == Control.Down && (wrongAction = currControl == Control.Right ? cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, 90) : cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, -90));
        return wrongAction;
      },
      getControlByAction: function getControlByAction(action) {
        var actionIndex = this.getActionIndex(action);
        if (0 == actionIndex) {
          var block = this.levelInfo.blocks[0];
          if (block.blockType == BlockType.Right_H) return Control.Right;
          if (block.blockType == BlockType.Left_H) return Control.Left;
          if (block.blockType == BlockType.Up_V) return Control.Up;
          if (block.blockType == BlockType.Down_V) return Control.Down;
        }
        return actionIndex;
      }
    });
    cc._RF.pop();
  }, {} ],
  Global: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "66d84kv8pZBFaCmZ9Jr4Z1M", "Global");
    "use strict";
    window.Control = cc.Enum({
      Start: 0,
      Down: 1,
      Left: 2,
      Right: 3,
      Up: 4,
      Circle: 5
    });
    window.BlockType = cc.Enum({
      Right_H: 0,
      Left_H: 1,
      Up_V: 2,
      Down_V: 3,
      Right_Up: 4,
      Right_Down: 5,
      Left_Up: 6,
      Left_Down: 7,
      Up_Right: 8,
      Up_Left: 9,
      Down_Right: 10,
      Down_Left: 11
    });
    window.LevelData = null;
    window.CAR_MOVE_ONE_GRID_TIME = .5;
    window.ROAD_WIDTH = 90;
    window.ROAD_HEIGHT = 90;
    window.ROAD_TURN_RATIO_1 = 1;
    window.ROAD_TURN_RATIO_2 = .25;
    cc._RF.pop();
  }, {} ],
  LanguageData: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "61de062n4dJ7ZM9/Xdumozn", "LanguageData");
    "use strict";
    var Polyglot = require("polyglot.min");
    var polyInst = null;
    window.i18n || (window.i18n = {
      languages: {},
      curLang: ""
    });
    false;
    function loadLanguageData(language) {
      return window.i18n.languages[language];
    }
    function initPolyglot(data) {
      data && (polyInst ? polyInst.replace(data) : polyInst = new Polyglot({
        phrases: data,
        allowMissing: true
      }));
    }
    module.exports = {
      init: function init(language) {
        if (language === window.i18n.curLang) return;
        var data = loadLanguageData(language) || {};
        window.i18n.curLang = language;
        initPolyglot(data);
        this.inst = polyInst;
      },
      t: function t(key, opt) {
        if (polyInst) return polyInst.t(key, opt);
      },
      inst: polyInst,
      updateSceneRenderers: function updateSceneRenderers() {
        var rootNodes = cc.director.getScene().children;
        var allLocalizedLabels = [];
        for (var i = 0; i < rootNodes.length; ++i) {
          var labels = rootNodes[i].getComponentsInChildren("LocalizedLabel");
          Array.prototype.push.apply(allLocalizedLabels, labels);
        }
        for (var _i = 0; _i < allLocalizedLabels.length; ++_i) {
          var label = allLocalizedLabels[_i];
          if (!label.node.active) continue;
          label.updateLabel();
        }
        var allLocalizedSprites = [];
        for (var _i2 = 0; _i2 < rootNodes.length; ++_i2) {
          var sprites = rootNodes[_i2].getComponentsInChildren("LocalizedSprite");
          Array.prototype.push.apply(allLocalizedSprites, sprites);
        }
        for (var _i3 = 0; _i3 < allLocalizedSprites.length; ++_i3) {
          var sprite = allLocalizedSprites[_i3];
          if (!sprite.node.active) continue;
          sprite.updateSprite(window.i18n.curLang);
        }
      }
    };
    cc._RF.pop();
  }, {
    "polyglot.min": "polyglot.min"
  } ],
  LevelData: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "48815AB6GFCdrCOqeqYU9vQ", "LevelData");
    "use strict";
    cc.Class({
      extends: cc.Component,
      onLoad: function onLoad() {
        LevelData = this;
        cc.game.addPersistRootNode(this.node);
      },
      start: function start() {
        var self = this;
        this.levels = [];
        this.levelID = 0;
        cc.loader.loadRes("data/leveldata", function(err, object) {
          if (err) {
            console.log("===>>>load level data error");
            return;
          }
          var levelData = object.json.levels;
          for (var i = 0; i < levelData.length; ++i) {
            var levelInfo = levelData[i];
            var levelItem = {};
            levelItem.id = i;
            levelItem.startPos = cc.v2(levelInfo.startPos.x, levelInfo.startPos.y);
            var blocks = levelInfo.items;
            levelItem.blocks = [];
            levelItem.actionDetails = [];
            levelItem.rightOrder = [];
            for (var j = 0; j < blocks.length; ++j) {
              var block = {};
              block.blockType = self.getBlockType(blocks[j].blockType);
              block.num = blocks[j].number;
              levelItem.blocks.push(block);
              block.blockType != BlockType.Right_H && block.blockType != BlockType.Left_H && block.blockType != BlockType.Up_V && block.blockType != BlockType.Down_V || levelItem.rightOrder.push(self.getControlByType(0 == j, block.blockType));
            }
            var keys = levelInfo.keys;
            levelItem.actions = [ 0, 0, 0, 0, 0, 0 ];
            for (var _j = 0; _j < keys.length; ++_j) levelItem.actions[keys[_j].id - 1] = keys[_j].nums;
            self.levels.push(levelItem);
          }
        });
      },
      getLevelInfoById: function getLevelInfoById() {
        if (this.levelID < 0) return null;
        return this.levels[this.levelID];
      },
      getTotalActionNums: function getTotalActionNums(id) {
        var totoalActionNums = 0;
        for (var i = 0; i < this.levels[id].length; ++i) totoalActionNums += this.levels[id].actions[i];
        return totoalActionNums;
      },
      getActionNums: function getActionNums(id, index) {
        return this.levels[id].actions[index];
      },
      getActionDetails: function getActionDetails(id, index) {
        return this.levels[id].actionDetails[index];
      },
      getBlockType: function getBlockType(mark) {
        var blockType = BlockType.Right_H;
        "r_h" == mark ? blockType = BlockType.Right_H : "l_h" == mark ? blockType = BlockType.Left_H : "u_v" == mark ? blockType = BlockType.Up_V : "d_v" == mark ? blockType = BlockType.Down_V : "r_u" == mark ? blockType = BlockType.Right_Up : "r_d" == mark ? blockType = BlockType.Right_Down : "l_u" == mark ? blockType = BlockType.Left_Up : "l_d" == mark ? blockType = BlockType.Left_Down : "u_r" == mark ? blockType = BlockType.Up_Right : "u_l" == mark ? blockType = BlockType.Up_Left : "d_r" == mark ? blockType = BlockType.Down_Right : "d_l" == mark && (blockType = BlockType.Down_Left);
        return blockType;
      },
      getControlByType: function getControlByType(bStart, type) {
        if (bStart) return Control.Start;
        var control = -1;
        type == BlockType.Right_H ? control = Control.Right : type == BlockType.Left_H ? control = Control.Left : type == BlockType.Up_V ? control = Control.Up : type == BlockType.Down_V && (control = Control.Down);
        return control;
      },
      getAction: function getAction(block, targetPos, distance) {
        var action = null;
        var blockType = block.blockType;
        switch (blockType) {
         case BlockType.Right_H:
         case BlockType.Left_H:
         case BlockType.Up_V:
         case BlockType.Down_V:
          action = cc.moveTo(distance / ROAD_WIDTH * CAR_MOVE_ONE_GRID_TIME, targetPos);
          break;

         case BlockType.Right_Up:
         case BlockType.Left_Down:
         case BlockType.Up_Left:
         case BlockType.Down_Right:
          action = cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, 90);
          break;

         case BlockType.Right_Down:
         case BlockType.Left_Up:
         case BlockType.Up_Right:
         case BlockType.Down_Left:
          action = cc.rotateBy(ROAD_TURN_RATIO_2 * CAR_MOVE_ONE_GRID_TIME * 2, -90);
        }
        return action;
      },
      setLevelID: function setLevelID(levelID) {
        this.levelID = levelID;
      },
      getLevelID: function getLevelID() {
        return this.levelID;
      },
      setMaxLevelID: function setMaxLevelID(levelID) {
        cc.sys.localStorage.setItem("level", levelID);
      },
      getMaxLevelID: function getMaxLevelID() {
        var maxLevelID = cc.sys.localStorage.getItem("level");
        maxLevelID || (maxLevelID = 0);
        return Number(maxLevelID);
      },
      getLevelNum: function getLevelNum() {
        return this.levels.length;
      },
      getLevelScore: function getLevelScore(id) {
        var score = cc.sys.localStorage.getItem("level_" + id + "_score");
        score || (score = 0);
        return Number(score);
      },
      saveLevelScore: function saveLevelScore(score) {
        var lastScore = cc.sys.localStorage.getItem("level_" + this.levelID + "_score");
        lastScore || (lastScore = 0);
        lastScore = Number(lastScore);
        lastScore < score && cc.sys.localStorage.setItem("level_" + this.levelID + "_score", score);
      }
    });
    cc._RF.pop();
  }, {} ],
  LevelItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "56480lCMQdAYoG13HUZljj+", "LevelItem");
    "use strict";
    var LevelItem = cc.Class({
      name: "LevelItem",
      properties: {
        id: 0,
        state: 0,
        score: 0
      }
    });
    module.exports = LevelItem;
    cc._RF.pop();
  }, {} ],
  LevelSelect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "dd87eAM5OZA2awF8rpvIZfY", "LevelSelect");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        initRoadPos: cc.v2(0, -770),
        initLevelPos: cc.v2(-600, -180),
        intervalX: 300,
        intervalY: 350,
        road: {
          default: null,
          type: cc.Prefab
        },
        level: {
          default: null,
          type: cc.Prefab
        }
      },
      onLoad: function onLoad() {
        var back = this.node.getChildByName("back");
        back.on(cc.Node.EventType.TOUCH_END, this.onBack, this);
        this.content = cc.find("scrollview/view/content", this.node);
      },
      start: function start() {
        this.levelNum = LevelData.getLevelNum();
        this.maxLevelID = LevelData.getMaxLevelID();
        this.levelNum <= 15 ? this.content.height = 1080 : this.content.height = 1080 + Math.floor((this.levelNum - 15 + 4) / 5) * this.intervalY;
        var roadNums = Math.floor((this.levelNum + 4) / 5);
        for (var i = 0; i < roadNums; ++i) {
          var road = cc.instantiate(this.road);
          road.parent = this.content;
          road.setPosition(this.initRoadPos.x, this.initRoadPos.y - i * this.intervalY);
        }
        for (var _i = 0; _i < this.levelNum; ++_i) {
          var level = cc.instantiate(this.level);
          level.parent = this.content;
          level.setPosition(this.initLevelPos.x + _i * this.intervalX, this.initLevelPos.y - Math.floor(_i / 5) * this.intervalY);
          level.scale = .8;
          var levelInfo = {};
          levelInfo.id = _i + 1;
          if (_i <= this.maxLevelID) {
            levelInfo.state = 2;
            var score = LevelData.getLevelScore(_i);
            levelInfo.score = score;
            level.on(cc.Node.EventType.TOUCH_END, this.onClickStart, this);
          } else {
            levelInfo.state = 1;
            levelInfo.score = 0;
          }
          var levelCmp = level.getComponent("Level");
          levelCmp.init(levelInfo);
        }
      },
      onClickStart: function onClickStart(event) {
        var level = event.target.getComponent("Level");
        var levelInfo = level.getLevelInfo();
        level.changeState(3);
        LevelData.setLevelID(levelInfo.id - 1);
        cc.director.loadScene("GameScene");
      },
      onBack: function onBack() {
        cc.director.loadScene("LobbyScene");
      }
    });
    cc._RF.pop();
  }, {} ],
  Level: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7fe71BIvLRP/7/mQkH8kOfY", "Level");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bg: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      init: function init(data) {
        this.levelInfo = data;
        var labNO = this.node.getChildByName("NO").getComponent(cc.Label);
        labNO.string = data.id;
        var sprBg = this.node.getComponent(cc.Sprite);
        sprBg.spriteFrame = this.bg[data.state];
        if (data.state >= 2 && data.score > 0) {
          var sprCup = this.node.getChildByName("cup");
          sprCup.active = true;
          for (var i = 0; i < data.score; ++i) {
            var sprSmallCup = this.node.getChildByName("small_cup_" + (i + 1));
            sprSmallCup.active = true;
          }
        }
      },
      changeState: function changeState(state) {
        var sprBg = this.node.getComponent(cc.Sprite);
        sprBg.spriteFrame = this.bg[state];
      },
      getLevelInfo: function getLevelInfo() {
        return this.levelInfo;
      }
    });
    cc._RF.pop();
  }, {} ],
  Lobby: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b17d0X/nwhF8LVDaUVZgBch", "Lobby");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {},
      start: function start() {
        var playModelLayout = this.node.getChildByName("play_model");
        for (var i = 0; i < 4; ++i) {
          var playModel = playModelLayout.getChildByName("play_model_" + (i + 1));
          playModel.on(cc.Node.EventType.TOUCH_END, this.onClickStart, this);
        }
      },
      onClickStart: function onClickStart() {
        cc.director.loadScene("LevelSelectScene");
      }
    });
    cc._RF.pop();
  }, {} ],
  LocalizedLabel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "744dcs4DCdNprNhG0xwq6FK", "LocalizedLabel");
    "use strict";
    var i18n = require("LanguageData");
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function later() {
          timeout = null;
          immediate || func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        callNow && func.apply(context, args);
      };
    }
    cc.Class({
      extends: cc.Component,
      editor: {
        executeInEditMode: true,
        menu: "i18n/LocalizedLabel"
      },
      properties: {
        dataID: {
          get: function get() {
            return this._dataID;
          },
          set: function set(val) {
            if (this._dataID !== val) {
              this._dataID = val;
              false;
              this.updateLabel();
            }
          }
        },
        _dataID: ""
      },
      onLoad: function onLoad() {
        false;
        i18n.inst || i18n.init();
        this.fetchRender();
      },
      fetchRender: function fetchRender() {
        var label = this.getComponent(cc.Label);
        if (label) {
          this.label = label;
          this.updateLabel();
          return;
        }
      },
      updateLabel: function updateLabel() {
        if (!this.label) {
          cc.error("Failed to update localized label, label component is invalid!");
          return;
        }
        var localizedString = i18n.t(this.dataID);
        localizedString && (this.label.string = i18n.t(this.dataID));
      }
    });
    cc._RF.pop();
  }, {
    LanguageData: "LanguageData"
  } ],
  LocalizedSprite: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f34ac2GGiVOBbG6XlfvgYP4", "LocalizedSprite");
    "use strict";
    var SpriteFrameSet = require("SpriteFrameSet");
    cc.Class({
      extends: cc.Component,
      editor: {
        executeInEditMode: true,
        inspector: "packages://i18n/inspector/localized-sprite.js",
        menu: "i18n/LocalizedSprite"
      },
      properties: {
        spriteFrameSet: {
          default: [],
          type: SpriteFrameSet
        }
      },
      onLoad: function onLoad() {
        this.fetchRender();
      },
      fetchRender: function fetchRender() {
        var sprite = this.getComponent(cc.Sprite);
        if (sprite) {
          this.sprite = sprite;
          this.updateSprite(window.i18n.curLang);
          return;
        }
      },
      getSpriteFrameByLang: function getSpriteFrameByLang(lang) {
        for (var i = 0; i < this.spriteFrameSet.length; ++i) if (this.spriteFrameSet[i].language === lang) return this.spriteFrameSet[i].spriteFrame;
      },
      updateSprite: function updateSprite(language) {
        if (!this.sprite) {
          cc.error("Failed to update localized sprite, sprite component is invalid!");
          return;
        }
        var spriteFrame = this.getSpriteFrameByLang(language);
        !spriteFrame && this.spriteFrameSet[0] && (spriteFrame = this.spriteFrameSet[0].spriteFrame);
        this.sprite.spriteFrame = spriteFrame;
      }
    });
    cc._RF.pop();
  }, {
    SpriteFrameSet: "SpriteFrameSet"
  } ],
  Splash: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a872azkQGVBH5N1qXRmxIH9", "Splash");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        video: {
          default: null,
          type: cc.Node
        }
      },
      onCompleted: function onCompleted(videoPlayer, eventType, customData) {
        if (eventType == cc.VideoPlayer.EventType.META_LOADED) videoPlayer.play(); else if (eventType == cc.VideoPlayer.EventType.COMPLETED) {
          var delay = cc.delayTime(.5);
          var loadScene = cc.callFunc(function() {
            cc.director.loadScene("LobbyScene");
          });
          this.node.runAction(cc.sequence(delay, loadScene));
        }
      },
      onDestroy: function onDestroy() {
        this.video.off("completed", this.onCompleted, this);
      }
    });
    cc._RF.pop();
  }, {} ],
  SpriteFrameSet: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "97019Q80jpE2Yfz4zbuCZBq", "SpriteFrameSet");
    "use strict";
    var SpriteFrameSet = cc.Class({
      name: "SpriteFrameSet",
      properties: {
        language: "",
        spriteFrame: cc.SpriteFrame
      }
    });
    module.exports = SpriteFrameSet;
    cc._RF.pop();
  }, {} ],
  en: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "03183xv1pJHkqPFE952hwF7", "en");
    "use strict";
    window.i18n || (window.i18n = {});
    window.i18n.languages || (window.i18n.languages = {});
    window.i18n.languages.en = {
      label: {
        hello: "Hello!",
        bye: "Goodbye!"
      }
    };
    cc._RF.pop();
  }, {} ],
  "polyglot.min": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e26fd9yy65A4q3/JkpVnFYg", "polyglot.min");
    "use strict";
    var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    (function(e, t) {
      "function" == typeof define && define.amd ? define([], function() {
        return t(e);
      }) : "object" == ("undefined" === typeof exports ? "undefined" : _typeof(exports)) ? module.exports = t(e) : e.Polyglot = t(e);
    })(void 0, function(e) {
      function t(e) {
        e = e || {}, this.phrases = {}, this.extend(e.phrases || {}), this.currentLocale = e.locale || "en", 
        this.allowMissing = !!e.allowMissing, this.warn = e.warn || c;
      }
      function s(e) {
        var t, n, r, i = {};
        for (t in e) if (e.hasOwnProperty(t)) {
          n = e[t];
          for (r in n) i[n[r]] = t;
        }
        return i;
      }
      function o(e) {
        var t = /^\s+|\s+$/g;
        return e.replace(t, "");
      }
      function u(e, t, r) {
        var i, s, u;
        return null != r && e ? (s = e.split(n), u = s[f(t, r)] || s[0], i = o(u)) : i = e, 
        i;
      }
      function a(e) {
        var t = s(i);
        return t[e] || t.en;
      }
      function f(e, t) {
        return r[a(e)](t);
      }
      function l(e, t) {
        for (var n in t) "_" !== n && t.hasOwnProperty(n) && (e = e.replace(new RegExp("%\\{" + n + "\\}", "g"), t[n]));
        return e;
      }
      function c(t) {
        e.console && e.console.warn && e.console.warn("WARNING: " + t);
      }
      function h(e) {
        var t = {};
        for (var n in e) t[n] = e[n];
        return t;
      }
      t.VERSION = "0.4.3", t.prototype.locale = function(e) {
        return e && (this.currentLocale = e), this.currentLocale;
      }, t.prototype.extend = function(e, t) {
        var n;
        for (var r in e) e.hasOwnProperty(r) && (n = e[r], t && (r = t + "." + r), "object" == ("undefined" === typeof n ? "undefined" : _typeof(n)) ? this.extend(n, r) : this.phrases[r] = n);
      }, t.prototype.clear = function() {
        this.phrases = {};
      }, t.prototype.replace = function(e) {
        this.clear(), this.extend(e);
      }, t.prototype.t = function(e, t) {
        var n, r;
        return t = null == t ? {} : t, "number" == typeof t && (t = {
          smart_count: t
        }), "string" == typeof this.phrases[e] ? n = this.phrases[e] : "string" == typeof t._ ? n = t._ : this.allowMissing ? n = e : (this.warn('Missing translation for key: "' + e + '"'), 
        r = e), "string" == typeof n && (t = h(t), r = u(n, this.currentLocale, t.smart_count), 
        r = l(r, t)), r;
      }, t.prototype.has = function(e) {
        return e in this.phrases;
      };
      var n = "||||", r = {
        chinese: function chinese(e) {
          return 0;
        },
        german: function german(e) {
          return 1 !== e ? 1 : 0;
        },
        french: function french(e) {
          return e > 1 ? 1 : 0;
        },
        russian: function russian(e) {
          return e % 10 === 1 && e % 100 !== 11 ? 0 : e % 10 >= 2 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) ? 1 : 2;
        },
        czech: function czech(e) {
          return 1 === e ? 0 : e >= 2 && e <= 4 ? 1 : 2;
        },
        polish: function polish(e) {
          return 1 === e ? 0 : e % 10 >= 2 && e % 10 <= 4 && (e % 100 < 10 || e % 100 >= 20) ? 1 : 2;
        },
        icelandic: function icelandic(e) {
          return e % 10 !== 1 || e % 100 === 11 ? 1 : 0;
        }
      }, i = {
        chinese: [ "fa", "id", "ja", "ko", "lo", "ms", "th", "tr", "zh" ],
        german: [ "da", "de", "en", "es", "fi", "el", "he", "hu", "it", "nl", "no", "pt", "sv" ],
        french: [ "fr", "tl", "pt-br" ],
        russian: [ "hr", "ru" ],
        czech: [ "cs" ],
        polish: [ "pl" ],
        icelandic: [ "is" ]
      };
      return t;
    });
    cc._RF.pop();
  }, {} ],
  zh: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "44badZgoSlI2YQG2Pr6eq+d", "zh");
    "use strict";
    window.i18n || (window.i18n = {});
    window.i18n.languages || (window.i18n.languages = {});
    window.i18n.languages.zh = {
      label: {
        hello: "\u4f60\u597d\uff01",
        bye: "\u518d\u89c1\uff01"
      }
    };
    cc._RF.pop();
  }, {} ]
}, {}, [ "en", "zh", "ActionControl", "Game", "Global", "Level", "LevelData", "LevelItem", "LevelSelect", "Lobby", "Splash", "LanguageData", "LocalizedLabel", "LocalizedSprite", "SpriteFrameSet", "polyglot.min" ]);