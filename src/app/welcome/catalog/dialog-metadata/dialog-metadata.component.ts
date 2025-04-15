import { IMetadata } from '@app/models/IMetadata';
import { SafeHtmlPipe } from '@app/pipes/SafeHtmlPipe';
import { ConfigService } from '@app/services/config.service';

import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardTitleGroup } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';


@Component({
  selector: 'gs2-dialog-metadata',
  templateUrl: './dialog-metadata.component.html',
  styleUrls: ['./dialog-metadata.component.scss'],
  imports: [
    MatCard, MatCardTitle, MatCardContent, MatIcon, MatCardHeader, MatCardTitleGroup,
    MatCardSubtitle, MatAccordion, MatExpansionPanel, MatExpansionPanelTitle,
    MatExpansionPanelDescription, SafeHtmlPipe, MatExpansionPanelHeader,
    MatList, MatListItem, MatCardActions, CommonModule, MatDialogModule
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
