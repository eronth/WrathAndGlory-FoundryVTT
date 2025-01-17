import { WrathAndGloryActor } from "./scripts/actor/actor.js";
import { WrathAndGloryItem } from "./scripts/item/item.js";
import { AgentSheet } from "./scripts/actor/sheet/agent.js";
import { ThreatSheet } from "./scripts/actor/sheet/threat.js";
import { initializeHandlebars } from "./scripts/common/handlebars.js";
import {RollDialog } from "./scripts/common/dialog.js";
//import { commonRoll, weaponRoll, damageRoll, psychicRoll } from "./scripts/common/roll.js";
import hooks from "./scripts/common/hooks.js"
import RuinGloryCounter from "./scripts/apps/counter.js"
import ItemTraits from "./scripts/apps/item-traits.js"
import WNG from "./scripts/common/config.js"
import { WrathAndGloryItemSheet } from "./scripts/item/sheet/item-sheet.js";
import WNGUtility from "./scripts/common/utility.js"
import { WNGTest, WrathDie, PoolDie } from "./scripts/common/tests/test.js";
import WeaponTest from "./scripts/common/tests/weapon-test.js";
import WrathAndGloryEffect from "./scripts/common/effect.js";
import WrathAndGloryEffectSheet from "./scripts/apps/active-effect-config.js";
import PowerTest from "./scripts/common/tests/power-test.js";
import CorruptionTest from "./scripts/common/tests/corruption-test.js";
import MutationTest from "./scripts/common/tests/mutation-test.js";
import ResolveTest from "./scripts/common/tests/resolve-test.js";

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = WrathAndGloryActor;
  CONFIG.Item.documentClass = WrathAndGloryItem;
  CONFIG.ActiveEffect.documentClass = WrathAndGloryEffect;
  CONFIG.ActiveEffect.sheetClass = WrathAndGloryEffectSheet;
  game.wng = {
    rollClasses : {
      WNGTest,
      WeaponTest,
      PowerTest,
      CorruptionTest,
      MutationTest,
      ResolveTest
    },
    dice : {
      WrathDie,
      PoolDie,
    },
    ItemTraits,
    RuinGloryCounter,
    utility : WNGUtility
  };

  CONFIG.Dice.terms.w = WrathDie;
  CONFIG.Dice.terms.p = PoolDie;


  game.wng.config = WNG
  CONFIG.Combat.initiative = { formula: "(@attributes.initiative.total)d6", decimals: 0 };
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wrath-and-glory", AgentSheet, { types: ["agent"], makeDefault: true });
  Actors.registerSheet("wrath-and-glory", ThreatSheet, { types: ["threat"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wrath-and-glory", WrathAndGloryItemSheet, {makeDefault : true});
  initializeHandlebars();
});


hooks()