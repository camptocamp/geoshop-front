

export const REQUIRED: string = $localize`:@@required:Required`;
export const DOWNLOAD: string = $localize`:@@download:Download`;
export const LOGIN: string = $localize`:@@login:Login`;
export const NEXT: string = $localize`:@@logout:Suivant`;
export const PREVIOUS: string = $localize`:@@previous:Retour`;
export const WRONG_EMAIL: string = $localize`:@@wrong_email:Format de courriel incorrect`;
export const WRONG_PHONE: string = $localize`:@@wrong_phone:Mauvais format de téléphone, accepté :`;

// FIXME currently this needs to be configured in the DB with the exact same string in the table geoshop.order_type
export const ORDERTYPE_PRIVATE = 'private';
export const ORDERTYPE_PUBLIC = 'public'; // This is the seccond typ but does not seem to be used

// Orders
export const ORDER_STATUS = {
  DRAFT: $localize`:@@order.draft:Brouillon`,
  PENDING: $localize`:@@order.pending:En attente du devis`,
  QUOTE_DONE: $localize`:@@order.quote_done:Devis réalisé, en attente de confirmation`,
  READY: $localize`:@@order.ready:Extraction en cours`,
  IN_EXTRACT: $localize`:@@order.in_extract:Extraction en cours`,
  PARTIALLY_DELIVERED: $localize`:@@order.part_delivered:Partiellement traitée`,
  PROCESSED: $localize`:@@order.processed:Traitée`,
  ARCHIVED: $localize`:@@order.archived:Archivée`,
  REJECTED: $localize`:@@order.rejected:Annulée`,
  // CONFIRM_REQUEST: $localize `:@@order.rejected:Rejected`, // TODO: looks not used
  UNKNOWN: $localize`:@@order.unkown:Etat inconnu`
};

export const ORDER_NAME = {
  PUBLIC: $localize`:@@order.public:Public`,
  PRIVATE: $localize`:@@order.private:Privé`
}

export const COUNTRIES = {
  CH: {
    name: $localize`:@@country.ch.name:Suisse`
  },
  FR: {
    name: $localize`:@@country.fr.name:France`
  }
};

export const SEARCH_CATEGORY: Map<string, string> = new Map([
  // Geocoder categories
  ["zipcode", $localize`:@@search.category.zipcode:Code postal`],
  ["gg25", $localize`:@@search.category.gemeinden:Communes`],
  ["district", $localize`:@@search.category.district:Districts`],
  ["kantone", $localize`:@@search.category.kanton:Cantons`],
  ["gazetteer", $localize`:@@search.category.gazetteer:Transports publics`],
  ["address", $localize`:@@search.category.address:Adresses`],
  ["parcel", $localize`:@@search.category.parcel:Parcelles`],
  // Mapfish categories
  ["Adressen", $localize`:@@search.category.address:Adresses`],
  ["Gemeindegrenzen", $localize`:@@search.category.gemeinden:Communes`],
  ["Kantone", $localize`:@@search.category.kanton:Cantons`],
]);

export const SEARCH_CATEGORY_GENERAL = $localize`:@@search.category.unknown:Général`;
