export class WrathAndGloryItem extends Item {


    _preUpdate(updateData, options, user)
    {
        if (hasProperty(updateData, "data.quantity") && updateData.data.quantity < 0)
            updateData.data.quantity = 0;
    }

    prepareData() {
        super.prepareData()
        if (this.type == "weapon")
            this.applyUpgrades();
    }

    prepareOwnedData() {
        let functionName = `prepareOwned${this.type[0].toUpperCase() + this.type.slice(1)}`

        if (this[functionName])
            this[functionName]()
    }


    prepareOwnedWeapon() {
        if (this.isRanged && this.category == "launcher" && this.Ammo)
        {
            this.data.data.damage = this.Ammo.damage
            this.data.data.ap = this.Ammo.ap
            this.data.data.ed = this.Ammo.ed
        }
    }

    async sendToChat() {
        const item = new CONFIG.Item.documentClass(this.data._source)
        if (item.data.img.includes("/unknown")) {
            item.data.img = null;
        }

        const html = await renderTemplate("systems/wrath-and-glory/template/chat/item.html", {item, data: item.data.data});
        const chatData = {
            user: game.user,
            rollMode: game.settings.get("core", "rollMode"),
            content: html,
        };
        if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
            chatData.whisper = ChatMessage.getWhisperRecipients("GM");
        } else if (chatData.rollMode === "selfroll") {
            chatData.whisper = [game.user];
        }
        ChatMessage.create(chatData);
    }

    _dataWithRank(type) {
        let data = this[type]
        let damage = data.base + data.bonus;
        let rank = "";
        if (data.rank === "single") {
            rank = " + R";
        } else if (data.rank === "double") {
            rank = " + DR";
        }
        return `${damage}${rank}`;
    }


    _dropdownData(){
        return {text : this.description}
    }


    applyUpgrades() {
        const overrides = {};
        let effects = this.Upgrades.reduce((effects, upgrade) => {
            return effects.concat(Array.from(upgrade.effects))
        }, [])
        // Organize non-disabled effects by their application priority
        const changes = effects.reduce((changes, e) => {
          if ( e.data.disabled ) return changes;
          return changes.concat(e.data.changes.map(c => {
            c = foundry.utils.duplicate(c);
            c.effect = e;
            c.priority = c.priority ?? (c.mode * 10);
            return c;
          }));
        }, []);
        changes.sort((a, b) => a.priority - b.priority);
    
        // Apply all changes
        for ( let change of changes ) {
          const result = change.effect.apply(this, change);
          if ( result !== null ) overrides[change.key] = result;
        }    

        this._applyUpgradeTraits() 
      }

    _applyUpgradeTraits()
    {
        let traits = this.Upgrades.reduce((traits, upgrade) => {
            return traits.concat(upgrade.traits)
        }, [])
        let add = traits.filter(i => i.type == "add")
        let remove = traits.filter(i => i.type == "remove")

        add.forEach(trait => {
            let existing = this.data.data.traits.find(i => i.name == trait.name)
            if (!existing)
                this.data.data.traits.push(trait)
            else if (existing && Number.isNumeric(trait.rating))
                existing.rating = parseInt(existing.rating) + parseInt(trait.rating)
        })

        remove.forEach(trait => {
            let existing = this.data.data.traits.find(i => i.name == trait.name)
            let existingIndex = this.data.data.traits.findIndex(i => i.name == trait.name)
            if (existing)
            {
                if (trait.rating && Number.isNumeric(trait.rating))
                {
                    existing.rating = parseInt(existing.rating) - parseInt(trait.rating)
                    if (existing.rating <= 0)
                        this.data.data.traits.splice(existingIndex, 1)
                }
                else 
                {
                        this.data.data.traits.splice(existingIndex, 1)
                }
            }
        })

    }

    async addCondition(effect) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
    
        let existing = this.hasCondition(effect.id)
    
        if (!existing) {
          effect.label = game.i18n.localize(effect.label)
          effect["flags.core.statusId"] = effect.id;
          delete effect.id
          return this.createEmbeddedDocuments("ActiveEffect", [effect])
        }
      }
    
      async removeCondition(effect, value = 1) {
        if (typeof (effect) === "string")
          effect = duplicate(CONFIG.statusEffects.find(e => e.id == effect))
        if (!effect)
          return "No Effect Found"
    
        if (!effect.id)
          return "Conditions require an id field"
    
        let existing = this.hasCondition(effect.id)
    
        if (existing) {
          return existing.delete()
        }
      }
    
    
      hasCondition(conditionKey) {
        let existing = this.effects.find(i => i.getFlag("core", "statusId") == conditionKey)
        return existing
      }

    // @@@@@@ FORMATTED GETTERs @@@@@@
    get Range() {
        const short = this.range.short < 1 ? "-" : this.range.short;
        const medium = this.range.medium < 1 ? "-" : this.range.medium;
        const long = this.range.long < 1 ? "-" : this.range.long;
        const salvo = this.salvo < 1 ? "-" : this.salvo;
        return `${salvo} | ${short} / ${medium} / ${long}`;
    }

    get Damage() {
        return this._dataWithRank("damage");
    }
    get ED() {
        return this._dataWithRank("ed");
    }
    get AP() {
        return this._dataWithRank("ap");
    }

    get Activation() {
        switch (this.activation) {
            case "free":
                return game.i18n.localize("ACTIVATION.FREE");
            case "action":
                return game.i18n.localize("ACTIVATION.ACTION");
            case "simple":
                return game.i18n.localize("ACTIVATION.SIMPLE");
            case "full":
                return game.i18n.localize("ACTIVATION.FULL");
            case "movement":
                return game.i18n.localize("ACTIVATION.MOVEMENT");
            default:
                return game.i18n.localize("ACTIVATION.ACTION");
        }
    }
    get Rarity() {
        switch (this.rarity) {
            case "common":
                return game.i18n.localize("RARITY.COMMON");
            case "uncommon":
                return game.i18n.localize("RARITY.UNCOMMON");
            case "rare":
                return game.i18n.localize("RARITY.RARE");
            case "very-rare":
                return game.i18n.localize("RARITY.VERY_RARE");
            case "unique":
                return game.i18n.localize("RARITY.UNIQUE");
            default:
                return game.i18n.localize("RARITY.COMMON");
        }
    }
    get Category() {
        switch (this.category) {
            case "melee":
                return game.i18n.localize("CATEGORY.MELEE");
            case "ranged":
                return game.i18n.localize("CATEGORY.RANGED");
            default:
                return game.i18n.localize("CATEGORY.MELEE");
        }
    }

    get MultiTarget() {
        return this.multiTarget ? game.i18n.localize("Yes") : game.i18n.localize("No")
    }

    get isMelee() {
        return this.category == "melee"
    }

    get isRanged() {
        return this.category == "ranged" || this.category == "launcher" || this.category == "grenade-missile"
    }

    get Traits () {
        return Object.values(this.traitList).map(i => i.display)
    }

    get TraitsAdd () {
        return Object.values(this.traitList).filter(i => i.type=="add").map(i => i.display)
    }

    
    get TraitsRemove () {
        return Object.values(this.traitList).filter(i => i.type=="remove").map(i => i.display)
    }

    get traitList () {
        let traits = {}
        this.data.data.traits.forEach(i => {
            traits[i.name] = {
                name : i.name,
                display : this.traitsAvailable[i.name],
                type : i.type
            }
            if (game.wng.config.traitHasRating[i.name])
            {
                traits[i.name].rating = i.rating;
                traits[i.name].display += ` (${i.rating})`
            }
        })
        return traits
    }
    
    get Upgrades() {
        return this.upgrades.map(i => new CONFIG.Item.documentClass(i))
    }

    get traitsAvailable() {
        if (this.type == "weapon" || this.type == "weaponUpgrade")
            return game.wng.config.weaponTraits
        else if (this.type == "armour")
            return game.wng.config.armourTraits
    }


    get skill() {
        if (this.isOwned)
        {
            if (this.type == "psychicPower")
                return this.actor.skills.psychicMastery
            else if (this.isMelee)
                return this.actor.skills.weaponSkill
            else 
                return this.actor.skills.ballisticSkill
        }
        else 
        {
            if (this.type == "psychicPower")
                return "psychicMastery"
            else if (this.isMelee)
                return "weaponSkill"
            else 
                return "ballisticSkill"
        }
    }

    get ammoList() {
        if (!this.isOwned)
            return
        if (this.category == "ranged")
            return this.actor.getItemTypes("ammo")
        else if (this.category == "launcher")
            return this.actor.getItemTypes("weapon").filter(i => i.category == "grenade-missile")

    }

    get Ammo() {
        if (this.isOwned)
            return this.actor.items.get(this.ammo)
    }

    // @@@@@@ TYPE GETTERS @@@@@@
    get isKeyword() { return this.type === "keyword" }
    get isTalent() { return this.type === "talent" }
    get isAbility() { return this.type === "ability" }
    get isTalentOrAbility() { return this.isTalent || this.isAbility }
    get isPsychicPower() { return this.type === "psychicPower" }
    get isArmour() { return this.type === "armour" }
    get isWeapon() { return this.type === "weapon" }
    get isWeaponUpgrade() { return this.type === "weaponUpgrade" }
    get isGear() { return this.type === "gear" }
    get isTraumaticInjury() { return this.type === "traumaticInjury" }
    get isMemorableInjury() { return this.type === "memorableInjury" }
    get isAscension() { return this.type === "ascension" }
    get isMutation() { return this.type === "mutation" }
    get isAmmo() { return this.type === "ammo" }
    get isAugmentic() { return this.type === "augmentic" }

    // @@@@@@ DATA GETTERS @@@@@@
    get ammo() { return this.data.data.ammo }
    get bonus() { return this.data.data.bonus }
    get effect() { return this.data.data.effect }
    get cost() { return this.data.data.cost }
    get requirements() { return this.data.data.requirements }
    get description() { return this.data.data.description }
    get display() { return this.data.data.display }
    get value() { return this.data.data.value }
    get rarity() { return this.data.data.rarity }
    get keywords() { return this.data.data.keywords }
    get quantity() { return this.data.data.quantity }
    get rating() { return this.data.data.rating }
    get traits() { return this.data.data.traits }
    get influence() { return this.data.data.influence }
    get benefits() { return this.data.data.benefits }
    get dn() { return this.data.data.dn }
    get activation() { return this.data.data.activation }
    get duration() { return this.data.data.duration }
    get range() { return this.data.data.range }
    get multiTarget() { return this.data.data.multiTarget }
    get prerequisites() { return this.data.data.prerequisites }
    get potency() { return this.data.data.potency }
    get damage() { return this.data.data.damage }
    get ed() { return this.data.data.ed }
    get attack() { return this.data.data.attack }
    get ap() { return this.data.data.ap }
    get category() { return this.data.data.category }
    get salvo() { return this.data.data.salvo }
    get upgrades() { return this.data.data.upgrades }
    get equipped() { return this.data.data.equipped }
    get test() {return this.data.data.test}
}