import { Component, Inject } from '@angular/core';
import { ConfigService } from '../../../_services/config.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { IMetadata } from '../../../_models/IMetadata';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardTitleGroup } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { SafeHtmlPipe } from '../../../_pipes/SafeHtmlPipe';
import { MatList, MatListItem } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'gs2-dialog-metadata',
  templateUrl: './dialog-metadata.component.html',
  styleUrls: ['./dialog-metadata.component.scss'],
  imports: [
    MatCard, MatCardTitle, MatCardContent, MatIcon, MatCardHeader, MatCardTitleGroup,
    MatCardSubtitle, MatAccordion, MatExpansionPanel, MatExpansionPanelTitle,
    MatExpansionPanelDescription, SafeHtmlPipe, MatExpansionPanelHeader,
    MatList, MatListItem, MatCardActions, CommonModule,
  ],
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
