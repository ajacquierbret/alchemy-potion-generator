// Select definitions
var select1 = document.getElementById('select1');
var select2 = document.getElementById('select2');
var select3 = document.getElementById('select3');
var select4 = document.getElementById('select4');
var select5 = document.getElementById('select5');
var select6 = document.getElementById('select6');

// Gets rarity select value from the DOM
var rarity1 = document.getElementById('raritySelect1');
var rarity2 = document.getElementById('raritySelect2');
var rarity3 = document.getElementById('raritySelect3');
var rarity4 = document.getElementById('raritySelect4');
var rarity5 = document.getElementById('raritySelect5');
var rarity6 = document.getElementById('raritySelect6');

var finalSelection = new Map;
var selectedIngredient;
var objectSelect;
var selectedKey;
var selectedValue = new Map;
var selectionViewer = document.getElementById('selectionViewer');
var customName;
var ingredientName;
var effects;
var result = document.getElementById('result');
var alchemyBonus = document.getElementById('alchemyBonus');
var diceRoll = document.getElementById('diceRoll');
var effectMalus = document.getElementById('effectMalus');
var effectMalusWarning = document.getElementById('effectMalusWarning');
var resultEquation;
var resultPotion;

$("#effectMalusWarning").hide();
$("#effectMalus").focusin(function(){
    $("#effectMalusWarning").show();
});

$("#effectMalus").focusout(function(){
    $("#effectMalusWarning").hide();
});


// Function for adding ingredients to selects
function addIngredients(listNumber, selectNumber) {
for (ingredient in listNumber) {
    effects = JSON.stringify(listNumber[ingredient]);
    selectNumber.options.add(new Option(ingredient, effects));
}
};

// This function inspects the rarity input and then push appropriate ingredients into the select
function inspectAndAddList(value, commonList, uncommonList, rareList, anySelect) {
    if ($(value).val() == "1") {
        anySelect.innerHTML = "";
        addIngredients(commonList, anySelect);
    }
    else if ($(value).val() == "2") {
        anySelect.innerHTML = "";
        addIngredients(uncommonList, anySelect);
    }
    else if ($(value).val() == "3") {
        anySelect.innerHTML = "";
        addIngredients(rareList, anySelect);
    }
};

// Multiple inspectAndAddList() function calls
$('#raritySelect1').change(function(){
inspectAndAddList(rarity1, rivenlandsCommon, rivenlandsUncommon, rivenlandsRare, select1);
});
$('#raritySelect2').change(function(){
inspectAndAddList(rarity2, midlandsCommon, midlandsUncommon, midlandsRare, select2);
});
$('#raritySelect3').change(function(){
inspectAndAddList(rarity3, chainlandsCommon, chainlandsUncommon, chainlandsRare, select3);
});
$('#raritySelect4').change(function(){
inspectAndAddList(rarity4, northCommon, northUncommon, northRare, select4);
});
$('#raritySelect5').change(function(){
inspectAndAddList(rarity5, eleonCommon, eleonUncommon, eleonRare, select5);
});
inspectAndAddList(rarity6, concentrates, undefined, undefined, select6);

function deleteItem(item) {
    finalSelection.delete(item);
};

function selectListener(select) {
$(select).change(function() {
    objectSelect = $(select).find("option:selected");
    selectedKey = JSON.stringify(objectSelect[0].innerHTML);
    selectedKey = JSON.parse(selectedKey);
    selectedValue = JSON.parse(objectSelect.val());
    finalSelection = finalSelection.set(selectedKey, selectedValue);
    ingredientName = selectedKey;
    selectionViewer.innerHTML += `<div class="alert alert-dismissible alert-info fade show text-center" role="alert"><strong>${ingredientName}</strong><button id="${ingredientName}" onClick="deleteItem(this.id)" type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span></button></div>`;
})
return finalSelection;
};

selectListener(select1);
selectListener(select2);
selectListener(select3);
selectListener(select4);
selectListener(select5);
selectListener(select6);

finalSelection = selectListener();

// Core algorythm of the generation process
// IMPORTANT : Special thanks to "volcanic" (Stackoverflow) that helped me improving this algorythm.
function generatePotion() {
    var effectObject = {};
    var resultPotion = '';
    finalSelection.forEach(function(ingredientEffects, ingredientName) {
      Object.keys(ingredientEffects).forEach(effect => {
        if (!effectObject[effect]) {
          effectObject[effect] = {
            values: ingredientEffects[effect],
            occurrences: 1
          };
        } else {
          effectObject[effect].occurrences++;
          effectObject[effect].values += ingredientEffects[effect];
        }
      });
    });
    Object.keys(effectObject).forEach(effect => {
      if (effectObject[effect].occurrences > 1) {
          if ((effectObject[effect].values) > 10) {
            (effectObject[effect].values) = 10;
          }
        resultEquation = Math.floor((((effectObject[effect].values) + -Math.abs(effectMalus.value)) * (+alchemyBonus.value + +diceRoll.value) / 10));
        if (resultEquation >= 1) {
        resultPotion += `${effect} : ${resultEquation}<br>`;
        }
        if (resultEquation < 1) {
            resultPotion = "The potion creation failed. All ingredients are lost.";
        }
      }
    })
    return resultPotion;
  };

// Listen to the state of the 'Generate' button
var generateButton = $('#generateButton');
generateButton.on('click', function() {
    if (finalSelection.size > 1 && finalSelection.size <= 6) {
    generatePotion();
    resultPotion = generatePotion();
    if (resultPotion === '') {
      resultPotion = "No matching effects were found.";
    }
    result.innerHTML = resultPotion;
    } else if (finalSelection.size === 0) {
        result.innerHTML = "Nothing Selected.";
    } else if (finalSelection.size === 1) {
        result.innerHTML = "You can't make a potion with a single ingredient."
    } else if (finalSelection.size > 6) {
        result.innerHTML = "You can't make a potion with more than six ingredients."
    }
});
