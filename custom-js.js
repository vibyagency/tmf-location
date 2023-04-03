// MATERIAL QUANTITY FIELDS
const STEP_WRAPPER_CLASS = "form-devis_step-wrapper";
const TAG_WRAPPER_CLASS = "form-devis_tag-wrapper";
const TAG_CLASS = "form-devis_tag";
const CARDS_CLASS = "devis_materiel_card";
const CARD_LISTS_CLASS = "cms-wrapper-materiel ";
const CARD_LABEL_CLASS = "h3";
const CARD_QUANTITY_FIELD_CLASS = 'input[type="number"]';
const CARD_UNITY_FIELD_CLASS = "form_input.is-select2";
const CARD_FIELDS_WRAPPER = "material_card-quantity-wrapper";
const CARD_SLUG_FIELD_CLASS = "hidden-id ";
const HIDDEN_LISTS_CLASS = "form-devis_hidden-list";
const FORM_INPUT_WRAPPER_CLASS = "form-info-product-wrapper";
const ALERT_MESSAGE =
  "Veuillez indiquer la quantité pour le.s matériel.s sélectionné.s";
const QUANTITY_NATURE = "quantity";
const UNITY_NATURE = "unity";
const cardLists = document.querySelectorAll(".cms-wrapper-materiel");
const cards = document.querySelectorAll(".form-devis_cms-item");
const buttons = document.querySelectorAll(".fake-button");
const activeCards = [];
const QUANTITY_MATERIAL_WRAPPER_CLASS = "quantity-material-code";
const OTHER_MATERIAL_IS_REQUIRED = "other-materials-required";
//--------------------------------------------------------------------------

const getCorrespondingHiddenList = (item) =>
  item
    .closest(`.${STEP_WRAPPER_CLASS}`)
    .querySelector(`.${HIDDEN_LISTS_CLASS}`);

const getCorrespondingTagList = (item) =>
  item.closest(`.${STEP_WRAPPER_CLASS}`).querySelector(`.${TAG_WRAPPER_CLASS}`);

const addToActiveArray = (slug) => {
  activeCards.push(slug);
};
const removeFromActiveArray = (slug) => {
  const i = activeCards.indexOf(slug);
  activeCards.splice(i, 1);
};

const getCardValues = (card) => {
  const rawTitleEl = card.querySelector(CARD_LABEL_CLASS);
  const title = rawTitleEl.textContent
    .replace(/^\s+/g, "")
    .replace(/\s+$/g, "");
  const rawSlugEl = card.querySelector(`.${CARD_SLUG_FIELD_CLASS}`);
  const slug = rawSlugEl.textContent.replace(/\s/g, "");
  const qtyField = card.querySelector(CARD_QUANTITY_FIELD_CLASS);
  const unityField = card.querySelector(`.${CARD_UNITY_FIELD_CLASS}`);
  const correspondingTagWrapper = getCorrespondingTagList(card);
  const correspondingHiddenListWrapper = getCorrespondingHiddenList(card);
  let qtyfieldVal, unityFieldVal;
  qtyField.value ? (qtyfieldVal = qtyField.value) : (qtyfieldVal = 0);
  unityField.value
    ? (unityFieldVal = unityField.value)
    : (unityFieldVal = "U / M");
  const cardAttr = {
    title: title,
    slug: slug,
    qtyField: qtyField,
    qtyFieldValue: qtyfieldVal,
    unityField: unityField,
    unityFieldValue: unityFieldVal,
    fieldsWrapper: card.querySelector(`.${CARD_FIELDS_WRAPPER}`),
    tagWrapper: correspondingTagWrapper,
    tag: correspondingTagWrapper.querySelector(`[slug="${slug}"]`),
    hiddenListWrapper: correspondingHiddenListWrapper,
    hiddenFields:
      correspondingHiddenListWrapper.querySelector('[slug="${slug}"]'),
    element: card,
  };
  return cardAttr;
};

const fieldUpdater = (card, hiddenList, tagList) => {
  const targetFields = hiddenList.querySelectorAll(
    `.form-info-product-wrapper[slug="${card.slug}"] input`
  );
  const fieldsArray = [...targetFields];
  fieldsArray[0].value = card.title;
  fieldsArray[1].value = card.qtyFieldValue;
  fieldsArray[2].value = card.unityFieldValue;
  fieldsArray[3].value = card.slug;
  const targetTag = tagList.querySelector(
    `.${TAG_CLASS}[slug="${card.slug}"] div`
  );
  targetTag.innerHTML = card.title;
};

const createAndAddInputs = (card, index, hook) => {
  const newInputs = document.createElement("div");
  newInputs.className = `form-info-product-wrapper form-info-product-wrapper-${index}`;
  newInputs.setAttribute("slug", card.slug);
  newInputs.innerHTML = `
      <input type="text" name="produit[${index}][name]" nature="name">
      <input type="number" name="produit[${index}][quantity]" nature="quantity">
      <input type="text" name="produit[${index}][unityType]" nature="unity">
      <input type="text" name="produit[${index}][id]" nature="id">
      `;
  card.hiddenFields = newInputs;
  hook.append(newInputs);
};
const createAndAddTag = (card, index, hook) => {
  const newTag = document.createElement("div");
  newTag.setAttribute("slug", card.slug);
  newTag.className = `form-devis_tag form-devis_tag-${index}`;
  newTag.innerHTML = `
      <div></div><div class="form-devis_tag-img-wrapper"><img src="https://uploads-ssl.webflow.com/63dcbcdf4f9bb8a65ec8bcad/641c10054dd339b6e9319b49_CROSS.png" loading="lazy" alt="" class="form-devis_tag-img"></div>
      `;
  card.tag = newTag;
  hook.append(newTag);
  newTag
    .querySelector(".form-devis_tag-img-wrapper")
    .addEventListener("click", tagCrossClickedHandler);
};

const addItem = (card, hiddenList, tagList) => {
  const index = activeCards.length;
  createAndAddInputs(card, index, hiddenList);
  createAndAddTag(card, index, tagList);
  addToActiveArray(card.slug);
  fieldUpdater(card, hiddenList, tagList);
  card.element.classList.add("is-active");
  card.fieldsWrapper.addEventListener("change", inputUpdateHandler);
  card.element
    .closest(`.${STEP_WRAPPER_CLASS}`)
    .querySelector(".fake-button")
    .classList.remove("is-disable");
};

const removeItem = (card, hiddenList, tagList) => {
  const itemToRemove = hiddenList.querySelector(
    `.form-info-product-wrapper[slug="${card.slug}"]`
  );
  const tagToRemove = tagList.querySelector(`[slug="${card.slug}"]`);
  hiddenList.removeChild(itemToRemove);
  card.fieldsWrapper.removeEventListener("change", inputUpdateHandler);
  tagList.removeChild(tagToRemove);
  removeFromActiveArray(card.slug);
  card.element.classList.remove("is-active");

  if (
    activeCards.length < 1 &&
    card.element
      .closest(`.${STEP_WRAPPER_CLASS}`)
      .classList.contains(`${OTHER_MATERIAL_IS_REQUIRED}`)
  ) {
    card.element
      .closest(`.${STEP_WRAPPER_CLASS}`)
      .querySelector(".fake-button")
      .classList.add("is-disable");
    //   buttons.forEach((button) => button.classList.add("is-disable"));
  }
};

//--------------------------------------------------------------------------

const tagCrossClickedHandler = function (e) {
  const clickedCross = e.target;
  const selectedTag = clickedCross.closest(`.${TAG_CLASS}`);
  const tagSlug = selectedTag.getAttribute("slug");
  const correspondingCards = [];
  const correspondingCardNodes = selectedTag
    .closest(`.${STEP_WRAPPER_CLASS}`)
    .querySelectorAll(`.${CARDS_CLASS}`);
  correspondingCardNodes.forEach((node) => {
    correspondingCards.push(getCardValues(node));
  });
  const correpCards = correspondingCards.filter(
    (card) => card.slug === tagSlug
  );
  const correpCard = correpCards[0];
  removeItem(
    correpCard,
    getCorrespondingHiddenList(clickedCross),
    getCorrespondingTagList(clickedCross)
  );
};
const inputUpdateHandler = function (e) {
  const clickedTarget = e.target;
  const targetValues = getCardValues(clickedTarget.closest(`.${CARDS_CLASS}`));
  fieldUpdater(
    targetValues,
    getCorrespondingHiddenList(clickedTarget),
    getCorrespondingTagList(clickedTarget)
  );
};

const cardClickHandler = (card) => {
  const cardInfo = getCardValues(card);
  const slug = cardInfo.slug;
  const tagList = card
    .closest(`.${STEP_WRAPPER_CLASS}`)
    .querySelector(`.${TAG_WRAPPER_CLASS}`);

  const hiddenList = getCorrespondingHiddenList(card);

  card.classList.contains("is-active")
    ? removeItem(cardInfo, hiddenList, tagList)
    : addItem(cardInfo, hiddenList, tagList);
};

const btnClickHandler = (button) => {
  const parentWrapper = button.closest(
    `.${STEP_WRAPPER_CLASS}.${QUANTITY_MATERIAL_WRAPPER_CLASS}`
  );
  const cardsList = parentWrapper.querySelector(`.${CARD_LISTS_CLASS}`);
  const activeItems = cardsList.querySelectorAll(".is-active");
  activeItems.forEach((item) => {
    const itemVal = getCardValues(item);
    fieldUpdater(itemVal, itemVal.hiddenListWrapper, itemVal.tagWrapper);
  });

  itemsCheck(activeItems) === 0
    ? button.previousSibling.click()
    : alert(ALERT_MESSAGE);
};

const itemsCheck = (itemsList) => {
  let isInvalid = 0;
  itemsArray = [...itemsList];
  itemsArray.forEach((item) => {
    const cardInfo = getCardValues(item);
    if (cardInfo.qtyFieldValue <= 0 || !cardInfo.qtyFieldValue) isInvalid += 1;
  });
  return isInvalid;
};

function init() {
  cardLists.forEach((list) => {
    list.addEventListener("click", (e) => {
      clickedCard = e.target.closest(`.${CARDS_CLASS}`);
      if (!clickedCard) {
        return;
      }
      cardValues = getCardValues(clickedCard);
      let isQtyField = e.target.closest(`${CARD_QUANTITY_FIELD_CLASS}`);
      let isunityField = e.target.closest(`.${CARD_UNITY_FIELD_CLASS}`);
      if (!isQtyField && !isunityField) {
        cardClickHandler(clickedCard);
      }
    });
  });

  buttons.forEach((btn) => {
    if (
      btn
        .closest(`.${STEP_WRAPPER_CLASS}`)
        .classList.contains(`${OTHER_MATERIAL_IS_REQUIRED}`)
    )
      btn.classList.add("is-disable");
    btn.addEventListener("click", (e) => {
      const btn = e.target.closest(".fake-button");
      if (!btn.classList.contains("is-disable")) btnClickHandler(btn);
    });
  });
}

init();

//API ENTREPRISE INSEE

const ENTREPRISE_WRAPPER_CLASS = "entreprise-api-step";
const INPUT_WRAPPER_CLASS = "form-input_wrapper";
const NAME_CLASS = "name-field";
const HIDDEN_WRAPPER_CLASS = "form-entreprise_hidden-wrapper";
const CARD_GRID_CLASS = "form-devis_grid";
const EMPTY_RESULT_CLASS = "cpny-empty-result";

const BASE_URL = `https://api.insee.fr/entreprises/sirene/V3/siret?q=`;
const SORT_URL = `&tri= dateDernierTraitementUniteLegale desc`;
const token = "9904b796-cdf8-3fe8-9063-b97541729148";
config = {
  headers: { Authorization: `Bearer ${token}` },
};

class Company {
  constructor(companyInfo) {
    this.info = companyInfo;
    this.info.completeAddress = this.transformAddress(this.info);
    this.info.companyName = this.info.uniteLegale.denominationUniteLegale;
  }

  transformAddress(e) {
    let address = "";
    const addressPath = e.adresseEtablissement;
    let cp, commune, cedex;
    if (addressPath.numeroVoieEtablissement) {
      const numero = addressPath.numeroVoieEtablissement;
      address += `${numero} `;
    }
    if (addressPath.typeVoieEtablissement) {
      const typeRue = addressPath.typeVoieEtablissement;
      address += `${typeRue} `;
    }
    if (addressPath.codePostalEtablissement) {
      const rue = addressPath.libelleVoieEtablissement;
      address += `${rue}`;
    }
    if (addressPath.complementAdresseEtablissement) {
      const complementAddresse = addressPath.complementAdresseEtablissement;
      address += `, ${complementAddresse},`;
    }
    if (addressPath.codePostalEtablissement) {
      const cp = addressPath.codePostalEtablissement;
      address += ` ${cp} `;
    }
    if (addressPath.codePostalEtablissement) {
      commune = addressPath.libelleCommuneEtablissement;

      address += `${commune}`;
    }
    if (addressPath.codeCedexEtablissement) {
      cedex = addressPath.codeCedexEtablissement;
      address += ` CEDEX ${cedex}`;
    }
    this.address = address;
    return this.address;
  }
}
class CompanyItem {
  constructor(company, hook, companyList) {
    this.company = company;
    this.companyList = companyList;
    this.render(hook);
  }
  render(hook) {
    const cardTemplate = `
    <div class="form-devis_cpny-card-title">
    <h4 class="form-devis_cpny-title">${this.company.info.uniteLegale.denominationUniteLegale}</h4>
    </div>
    <div class="padding-top padding-small">
      <div class="form-devis_cpny-adress">
        <img
          loading="lazy"
          src="https://uploads-ssl.webflow.com/63dcbcdf4f9bb8a65ec8bcad/63ff4045d5db7142a8b0b7df_Vector-3.png"
          alt="Lieu icône"
          class="form-devis_cpny-adress-img"
        />
        <div class="form-devis_cpny-adress-text">${this.company.info.completeAddress}</div>
      </div>
    </div>
  </div>
  <div class="form-devis_cpny-siret">${this.company.info.siret}</div>
    `;

    const newCardEl = document.createElement("div");
    newCardEl.className = `form-devis_cpny-card`;
    newCardEl.innerHTML = cardTemplate;
    this.el = newCardEl;
    hook.append(newCardEl);
  }
}
class CompaniesList {
  companies = [];
  queriedCompanies = [];
  displayedCompanies = [];
  constructor(queryResults, hook) {
    this.wrapper = hook;
    queryResults.length > 0
      ? Tooltip.displayEmptyBlockSwitch(false)
      : Tooltip.displayEmptyBlockSwitch(true);
    this.hookEl = this.wrapper.querySelector(`.${CARD_GRID_CLASS}`);
    this.queryResults = queryResults;
    this.queryResults.forEach((etablissement) => {
      const newCompany = new Company(etablissement);
      this.queriedCompanies.push(newCompany);
    });
    this.renderCards();
  }

  clearGrid() {
    this.hookEl.innerHTML = "";
  }
  renderCards() {
    this.clearGrid();
    if (this.queriedCompanies.length > 0)
      this.queriedCompanies.forEach((company) => {
        const newDisplayedCard = new CompanyItem(company, this.hookEl, this);
        this.displayedCompanies.push(newDisplayedCard);
      });
  }
}

class FieldListItem {
  constructor(domEl) {
    this.el = domEl;
  }
}

class FieldList {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.el = wrapper.querySelector(`.${INPUT_WRAPPER_CLASS}`);
    this.firstInput = new FieldListItem(
      this.el.querySelector(`input:first-of-type`)
    );
    this.secondInput = new FieldListItem(
      this.el.querySelector(`input:last-of-type`)
    );

    this.hiddenFields = {
      nameField: this.el.querySelector(
        `.${HIDDEN_WRAPPER_CLASS} input.entreprise-name-value`
      ),

      addressField: this.el.querySelector(
        `.${HIDDEN_WRAPPER_CLASS} input.entreprise-address-value`
      ),

      siretField: this.el.querySelector(
        `.${HIDDEN_WRAPPER_CLASS} input.entreprise-siret-value`
      ),

      fullnameField: this.el.querySelector(
        `.${HIDDEN_WRAPPER_CLASS} input.entreprise-fullname-value`
      ),

      sexeField: this.el.querySelector(
        `.${HIDDEN_WRAPPER_CLASS} input.entreprise-sexe-value`
      ),
    };

    this.el.addEventListener("input", this.inputFieldsHandler.bind(this));
  }
  async inputFieldsHandler(e) {
    const query = this.getQuery(e);
    if (query) queriedResults = await this.getData(query);
  }

  renderResults(etablissements) {
    const results = new CompaniesList(etablissements, this.wrapper);
    this.currentResults = results;
    results.displayedCompanies.forEach((company) => {
      company.fieldsList = this;
      company.el.addEventListener(
        "click",
        this.clickedCardHandler.bind(company)
      );
    });
  }

  clickedCardHandler() {
    Tooltip.removeAllActiveCards();
    this.el.classList.add("is-active");
    this.fieldsList.firstInput.el.value = this.company.info.companyName;
    this.fieldsList.hiddenFields.siretField.value = this.company.info.siret;
    this.fieldsList.hiddenFields.nameField.value =
      this.company.info.companyName;
    this.fieldsList.hiddenFields.addressField.value = this.company.address;
    this.fieldsList.hiddenFields.sexeField.value = this.company.info.siret;
  }

  getQuery(e) {
    let nameVal;
    let locationVal;
    nameVal = this.firstInput.el.value;
    locationVal = this.secondInput.el.value;
    if (e.target === this.secondInput.el) {
      if (nameVal.length < 3) {
        return;
      }
    }
    const query = {
      name: nameVal,
      location: locationVal,
    };
    return query;
  }

  async getData(query) {
    let url;
    let rawQueryName;
    let queryName, queryNameWords, queryNameWords2, queryLocation, querySiret;

    if (query.location) queryLocation = query.location.toString();

    rawQueryName = query.name.toString().toUpperCase();
    if (query.siret) querySiret = query.siret.toString();
    queryNameWords = rawQueryName.split(" ");
    queryNameWords2 = rawQueryName.replace(" ", "?");

    if (querySiret) {
      url = `${BASE_URL}siret:${querySiret}*`;
    }

    if (rawQueryName) {
      url = `${BASE_URL}(denominationUniteLegale:"${queryNameWords[0]}" OR denominationUniteLegale:*${queryNameWords[0]}*)`;
      queryNameWords.forEach((w, i) => {
        if (!i === 0) {
          url += ` AND (denominationUniteLegale:*${queryNameWords[i]}*)`;
        }
      });
      if (queryLocation) {
        url += `AND ((libelleCommuneEtablissement:${queryLocation}*) OR (codePostalEtablissement:${queryLocation}*))`;
      }
      url += `AND etatAdministratifUniteLegale:A`;
      url += SORT_URL;
    }
    axios
      .get(url, config)
      .catch((err) => {
        if (err.response.status === 404) {
          console.log("404");
          return;
        }
      })
      .then((res) => {
        let etablissements;
        if (res.data) {
          etablissements = res.data.etablissements;
          this.renderResults(etablissements);
        }
      })
      .catch((err) => {
        const etablissements = [];
        this.displayNoResultField();
        this.renderResults(etablissements);
      });
  }

  displayNoResultField() {
    console.log("Pas de résultat");
  }
}
class Tooltip {
  static clearGrids() {
    const allGrids = document.querySelectorAll(`.${CARD_GRID_CLASS}`);
    allGrids.forEach((grid) => {
      grid.innerHTML = "";
    });
  }
  static removeAllActiveCards() {
    const allCards = document.querySelectorAll(".form-devis_cpny-card");
    allCards.forEach((card) => {
      card.classList.remove("is-active");
    });
  }

  static displayEmptyBlockSwitch(status) {
    const blocks = document.querySelectorAll(`.${EMPTY_RESULT_CLASS}`);
    status
      ? blocks.forEach((block) => block.classList.remove("hide"))
      : blocks.forEach((block) => block.classList.add("hide"));
  }
}

class App {
  static init() {
    Tooltip.clearGrids();
    Tooltip.displayEmptyBlockSwitch(false);
    const steps = document.querySelectorAll(`.${ENTREPRISE_WRAPPER_CLASS}`);
    steps.forEach((step) => {
      const companiesList = new FieldList(step);
      this.lists = [];
      this.lists.push(companiesList);
    });
  }
}

App.init();
