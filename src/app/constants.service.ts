import { Injectable } from '@angular/core';
import { Dictionary } from '@ngrx/entity';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  constructor() { }

  static readonly REQUIRED: string = $localize`:@@required:Required`;
  static readonly DOWNLOAD: string = $localize`:@@download:Download`;
  static readonly LOGIN: string = $localize`:@@login:Login`;
  static readonly NEXT: string = $localize`:@@logout:Suivant`;
  static readonly PREVIOUS: string = $localize`:@@previous:Retour`;
  static readonly WRONG_EMAIL: string = $localize`:@@wrong_email:Format de courriel incorrect`;
  static readonly WRONG_PHONE: string = $localize`:@@wrong_phone:Mauvais format de téléphone, accepté :`;
  // FIXME currently this needs to be configured in the DB with the exact same string in the table geoshop.order_type
  static readonly ORDERTYPE_PRIVATE: string = 'private';
  // static readonly ORDERTYPE_PUBLIC: string = 'public'; // This is the seccond typ but does not seem to be used
  // Orders
  static ORDER_STATUS = {
    DRAFT: $localize `:@@order.draft:Brouillon`,
    PENDING: $localize `:@@order.pending:En attente du devis`,
    QUOTE_DONE: $localize `:@@order.quote_done:Devis réalisé, en attente de confirmation`,
    READY: $localize `:@@order.ready:Extraction en cours`,
    IN_EXTRACT:$localize `:@@order.in_extract:Extraction en cours`,
    PARTIALLY_DELIVERED: $localize `:@@order.part_delivered:Partiellement traitée`,
    PROCESSED: $localize `:@@order.processed:Traitée`,
    ARCHIVED: $localize `:@@order.archived:Archivée`,
    REJECTED: $localize `:@@order.rejected:Annulée`,
    // CONFIRM_REQUEST: $localize `:@@order.rejected:Rejected`, // TODO: looks not used
    UNKNOWN: $localize `:@@order.unkown:Etat inconnu`
  };

  static ORDER_NAME = {
    PUBLIC: $localize `:@@order.public:Public`,
    PRIVATE: $localize `:@@order.private:Privé`
  }
}
