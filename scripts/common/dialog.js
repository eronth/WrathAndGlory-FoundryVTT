import WrathAndGloryEffect from "./effect.js";

export class RollDialog extends Dialog {

  static get defaultOptions() {
    let options = super.defaultOptions
    options.classes.push("roll-dialog")
    options.resizable = true;
    return options
  }


  static async create(data) {
    const html = await renderTemplate("systems/wrath-and-glory/template/dialog/common-roll.html", data);
    return new Promise((resolve) => {
      new this({
        title: game.i18n.localize(data.title),
        content: html,
        effects: data.effects,
        buttons: {
          roll: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("BUTTON.ROLL"),
            callback: async (html) => {
              let data = this.dialogCallback(html)
              resolve(data)
            },
          }
        },
        default: "roll"
      }, { width: 430 }).render(true)
    })
  }

  static dialogCallback(html) {
    let testData = this._baseTestData()
    testData.difficulty.target = parseInt(html.find("#difficulty-target")[0].value);
    testData.difficulty.penalty = parseInt(html.find("#difficulty-penalty")[0].value);
    testData.difficulty.rank = html.find("#difficulty-rank")[0].value;
    testData.pool.size = parseInt(html.find("#pool-size")[0].value);
    testData.pool.bonus = parseInt(html.find("#pool-bonus")[0].value);
    testData.pool.rank = html.find("#pool-rank")[0].value;
    return testData
  }


  static _baseTestData() {
    return {
      difficulty: {
        target: 3,
        penalty: 0,
        rank: "none"
      },
      pool: {
        size: 1,
        bonus: 0,
        rank: "none"
      },
      wrath: {
        base: 1
      }
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    // Reset effect values
    this.effectValues = {
      "pool.base": null,
      "pool.rank": null,
      "pool.bonus": null,
      "difficulty.base": null,
      "difficulty.rank": null,
      "difficulty.bonus": null
    }


    this.inputs = {}

    html.find("input").focusin(ev => {
      ev.target.select();
    })

    html.find('.difficulty,.pool').change(ev => {
      let type = ev.currentTarget.classList[0]
      let input = ev.currentTarget.classList[1]
      this.userEntry[`${type}.${input}`] = Number.isNumeric(ev.target.value) ? parseInt(ev.target.value) : ev.target.value
      this.applyEffects()
    }).each((i, input) => {
      this.inputs[`${input.classList[0]}.${input.classList[1]}`] = input
    })

    this.userEntry = {
      "pool.base": parseInt(this.inputs["pool.base"].value),
      "pool.rank": this.inputs["pool.rank"].value,
      "pool.bonus": parseInt(this.inputs["pool.bonus"].value),
      "difficulty.base": parseInt(this.inputs["difficulty.base"].value),
      "difficulty.rank": this.inputs["difficulty.rank"].value,
      "difficulty.bonus": parseInt(this.inputs["difficulty.bonus"].value),
    }

    html.find(".effect-select").change(this._onEffectSelect.bind(this))
  }

  _onEffectSelect(ev) {
    // Reset effect values
    for (let key in this.effectValues)
      this.effectValues[key] = null

    let selectedEffects = $(ev.currentTarget).val().map(i => this.data.effects[parseInt(i)])
    let changes = selectedEffects.reduce((prev, current) => prev = prev.concat(current.data.changes), []).filter(i => i.mode == 0)
    for (let c of changes) {
      if (WrathAndGloryEffect.numericTypes.includes(c.key))
        this.effectValues[c.key] = (this.effectValues[c.key] || 0) + parseInt(c.value)
      else if (Object.keys(game.wng.config.rankTypes).concat(Object.keys(game.wng.config.difficultyRankTypes)).includes(c.value))
        this.effectValues[c.key] = c.value
    }
    this.applyEffects()
  }

  applyEffects() {
    for (let input in this.inputs) {
      if (!this.inputs[input])
        continue
      if (this.effectValues[input] != null) {
        if (Number.isNumeric(this.effectValues[input]))
          this.inputs[input].value = this.userEntry[input] + this.effectValues[input]
        else
          this.inputs[input].value = this.effectValues[input]
      }
      else // if not part of effect values, use user entry only
      {
        this.inputs[input].value = this.userEntry[input]
      }
    }
  }
}


export class WeaponDialog extends RollDialog {

  static async create(data) {
    const html = await renderTemplate("systems/wrath-and-glory/template/dialog/weapon-roll.html", data);
    return new Promise((resolve) => {
      new this({
        title: game.i18n.localize(data.title),
        content: html,
        effects: data.effects,
        buttons: {
          roll: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("BUTTON.ROLL"),
            callback: async (html) => {
              let data = this.dialogCallback(html)
              resolve(data)
            },
          }
        },
        default: "roll"
      }, { width: 550 }).render(true)
    })
  }

  static dialogCallback(html) {
    let testData = super.dialogCallback(html)
    testData.damage.base = parseInt(html.find("#damage-base")[0].value);
    testData.damage.bonus = parseInt(html.find("#damage-bonus")[0].value);
    testData.damage.rank = html.find("#damage-rank")[0].value;
    testData.ed.base = parseInt(html.find("#ed-base")[0].value);
    testData.ed.bonus = parseInt(html.find("#ed-bonus")[0].value);
    testData.ed.rank = html.find("#ed-rank")[0].value;
    testData.ap.base = parseInt(html.find("#ap-base")[0].value);
    testData.ap.bonus = parseInt(html.find("#ap-bonus")[0].value);
    testData.ap.rank = html.find("#ap-rank")[0].value;
    testData.ed.die.one = parseInt(html.find("#die-one")[0].value);
    testData.ed.die.two = parseInt(html.find("#die-two")[0].value);
    testData.ed.die.three = parseInt(html.find("#die-three")[0].value);
    testData.ed.die.four = parseInt(html.find("#die-four")[0].value);
    testData.ed.die.five = parseInt(html.find("#die-five")[0].value);
    testData.ed.die.six = parseInt(html.find("#die-six")[0].value);
    return testData
  }

  static _baseTestData() {
    return mergeObject({
      damage: {
        base: 0,
        rank: "none",
        bonus: 0
      },
      ed: {
        base: 0,
        rank: "none",
        bonus: 0,
        die: {
          one: 0,
          two: 0,
          three: 0,
          four: 1,
          five: 1,
          six: 2
        }
      },
      ap: {
        base: 0,
        rank: "none",
        bonus: 0
      },
    }, super._baseTestData())
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Reset effect values
    this.effectValues = flattenObject(mergeObject(this.effectValues, {
      "damage.base": null,
      "damage.rank": null,
      "damage.bonus": null,
      "ed.base": null,
      "ed.rank": null,
      "ed.bonus": null,
      "ap.base": null,
      "ap.rank": null,
      "ap.bonus": null,
    }))


    html.find('.damage,.ed,.ap').change(ev => {
      let type = ev.currentTarget.classList[0]
      let input = ev.currentTarget.classList[1]
      this.userEntry[`${type}.${input}`] = Number.isNumeric(ev.target.value) ? parseInt(ev.target.value) : ev.target.value
      this.applyEffects()
    }).each((i, input) => {
      this.inputs[`${input.classList[0]}.${input.classList[1]}`] = input
    })

    this.userEntry = flattenObject(mergeObject(this.userEntry, {
      "damage.base": parseInt(this.inputs["damage.base"].value),
      "damage.rank": this.inputs["damage.rank"].value,
      "damage.bonus": parseInt(this.inputs["damage.bonus"].value),
      "ed.base": parseInt(this.inputs["ed.base"].value),
      "ed.rank": this.inputs["ed.rank"].value,
      "ed.bonus": parseInt(this.inputs["ed.bonus"].value),
      "ap.base": parseInt(this.inputs["ap.base"].value),
      "ap.rank": this.inputs["ap.rank"].value,
      "ap.bonus": parseInt(this.inputs["ap.bonus"].value),
    }))
  }
}

export class PowerDialog extends RollDialog {

  static async create(data) {
    const html = await renderTemplate("systems/wrath-and-glory/template/dialog/psychic-roll.html", data);
    return new Promise((resolve) => {
      new this({
        title: game.i18n.localize(data.title),
        content: html,
        effects: data.effects,
        buttons: {
          roll: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("BUTTON.ROLL"),
            callback: async (html) => {
              let data = this.dialogCallback(html)
              resolve(data)
            },
          }
        },
        default: "roll"
      }, { width: 550 }).render(true)
    })
  }

  static dialogCallback(html) {
    let testData = super.dialogCallback(html)
    testData.damage.base = parseInt(html.find("#damage-base")[0].value);
    testData.damage.bonus = parseInt(html.find("#damage-bonus")[0].value);
    testData.damage.rank = html.find("#damage-rank")[0].value;
    testData.ed.base = parseInt(html.find("#ed-base")[0].value);
    testData.ed.bonus = parseInt(html.find("#ed-bonus")[0].value);
    testData.ed.rank = html.find("#ed-rank")[0].value;
    testData.ed.die.one = parseInt(html.find("#die-one")[0].value);
    testData.ed.die.two = parseInt(html.find("#die-two")[0].value);
    testData.ed.die.three = parseInt(html.find("#die-three")[0].value);
    testData.ed.die.four = parseInt(html.find("#die-four")[0].value);
    testData.ed.die.five = parseInt(html.find("#die-five")[0].value);
    testData.ed.die.six = parseInt(html.find("#die-six")[0].value);
    testData.wrath.base = parseInt(html.find("#wrath-base")[0].value);
    testData.potency = html.find("#potency")[0].value;
    return testData
  }

  static _baseTestData() {
    return mergeObject({
      damage: {
        base: 0,
        rank: "none",
        bonus: 0
      },
      ed: {
        base: 0,
        rank: "none",
        bonus: 0,
        die: {
          one: 0,
          two: 0,
          three: 0,
          four: 1,
          five: 1,
          six: 2
        }
      },
      potency: 0
    }, super._baseTestData())
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Reset effect values
    this.effectValues = flattenObject(mergeObject(this.effectValues, {
      "damage.base": null,
      "damage.rank": null,
      "damage.bonus": null,
      "ed.base": null,
      "ed.rank": null,
      "ed.bonus": null,
      "wrath" : null
    }))


    html.find('.damage,.ed').change(ev => {
      let type = ev.currentTarget.classList[0]
      let input = ev.currentTarget.classList[1]
      this.userEntry[`${type}.${input}`] = Number.isNumeric(ev.target.value) ? parseInt(ev.target.value) : ev.target.value
      this.applyEffects()
    }).each((i, input) => {
      this.inputs[`${input.classList[0]}.${input.classList[1]}`] = input
    })

    this.inputs.wrath = html.find("#wrath-base").change(ev => {
      this.userEntry["wrath"] = parseInt(ev.target.value)
      this.applyEffects();
    })[0]


    this.userEntry = flattenObject(mergeObject(this.userEntry, {
      "damage.base": parseInt(this.inputs["damage.base"].value),
      "damage.rank": this.inputs["damage.rank"].value,
      "damage.bonus": parseInt(this.inputs["damage.bonus"].value),
      "ed.base": parseInt(this.inputs["ed.base"].value),
      "ed.rank": this.inputs["ed.rank"].value,
      "ed.bonus": parseInt(this.inputs["ed.bonus"].value),
      "wrath": parseInt(this.inputs["wrath"].value)
    }))
  }

}

function _getTargetDefense() {
  const targets = game.user.targets.size;
  if (0 >= targets) {
    return 3;
  }

  return game.user.targets.values().next().value.actor.combat.defense.total;
}
