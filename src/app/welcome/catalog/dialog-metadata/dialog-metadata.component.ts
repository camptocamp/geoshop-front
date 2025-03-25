import { Component, Inject } from '@angular/core';
import { ConfigService } from '../../../_services/config.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { IMetadata } from '../../../_models/IMetadata';

@Component({
  selector: 'gs2-dialog-metadata',
  templateUrl: './dialog-metadata.component.html',
  styleUrls: ['./dialog-metadata.component.scss'],

})
export class DialogMetadataComponent {

  showLongDescription = false;
  mediaUrl: string | undefined;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogMetadataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IMetadata,
    private configService: ConfigService
  ) {
    this.mediaUrl = this.configService.config?.mediaUrl ? `${this.configService.config.mediaUrl}/` : '';
  }

}
