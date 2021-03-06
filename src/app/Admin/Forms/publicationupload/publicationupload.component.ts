import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { CRUDService } from '../crud.service';
import { PublicationService } from './publication.service';
import { Publication } from 'src/app/Classes/publication';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-publicationupload',
  templateUrl: './publicationupload.component.html',
  styleUrls: ['./publicationupload.component.css']
})
export class PublicationuploadComponent implements OnInit, OnChanges, OnDestroy {

  @Input() disabled = false;
  pubsList: Publication[];
  publicationForm = this.createForm();
  authorArray = <FormArray>this.publicationForm.controls.authors;
  message: string;
  subscription: Subscription;
  key: string;
  edit = false;

  constructor(private fb: FormBuilder,
              private pubserv: PublicationService,
              private CRUD: CRUDService) { }

  ngOnInit() {
    this.subscription = this.pubserv.publicationList
                        .subscribe(pubs => this.pubsList = pubs);
  }

  ngOnChanges(){
    if(this.disabled){
      this.publicationForm.disable();
    }else{
      this.publicationForm.enable();
    }
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  onSubmit(type: boolean) {
    this.message = "Processing Data..."
    const newPublications = Object.assign({}, this.publicationForm.value);
    newPublications.authors = this.formatAuthors(newPublications.authors);
    this.pubserv.editSubmit(newPublications, type, this.key)
    .then(() => {
      this.message = 'Success!';
      setTimeout(() => { this.message = undefined; }, 3000);
      this.onReset();
    });
  }

  onDelete(){
    this.pubserv.delete(this.key).then(() => {
      this.message = 'Successfully Deleted!';
      setTimeout(() => { this.message = undefined; }, 3000);
      this.onReset();
    });
  }

  formatAuthors(authors: any[]) {
    const finalAuthors: string[] = [];
    authors.forEach(author => {
      finalAuthors.push(author.name);
    });
    return finalAuthors;
  }
  addAuthor(add: boolean, name: string = '') {
    if (add) {
      this.authorArray.push(this.fb.group({name: name}));
    } else {
      this.authorArray.removeAt(this.authorArray.length - 1);
    }
  }
  createForm() {
    return this.fb.group({
    type: 'article',
    authors: this.fb.array([this.fb.group({name: ''})]),
    year: ['', Validators.required],
    title: ['', Validators.required],
    journal: '',
    book: '',
    series: '',
    editors: '',
    doi: '',
    issue: '',
    volume: '',
    first_page: '',
    last_page: '',
    article_number: '',
    publisher: '',
    city: '',
    });
  }

  onNameChange(index: number){
    if(index === -1){
      this.publicationForm = this.createForm();
      delete this.key;
      this.edit = false;
    }else{
      this.CRUD.quickAssign(this.publicationForm, this.pubsList[index]);
      this.authorArray.value.forEach(() => this.addAuthor(false));
      this.pubsList[index].authors.forEach(author => this.addAuthor(true, author));
      this.key = this.pubsList[index].key;
      this.edit = true
    }
    
  }

  onReset(){
    this.publicationForm = this.createForm();
    this.authorArray = <FormArray>this.publicationForm.controls.authors;
    delete this.key;
    this.edit = false;
  }
}
