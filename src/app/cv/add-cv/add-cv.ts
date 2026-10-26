import { Component, inject, signal } from '@angular/core';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../config/routes.config';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';

interface AddCvModel {
  name: string;
  firstname: string;
  path: string;
  job: string;
  cin: string;
  age: number;
}

@Component({
  imports: [FormField],
  selector: 'app-add-cv',
  templateUrl: './add-cv.html',
})
export class AddCv {
  private readonly cvService = inject(CvService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  private readonly model = signal<AddCvModel>({
    name: '',
    firstname: '',
    path: '',
    job: '',
    cin: '',
    age: 0,
  });

  protected readonly addForm = form(this.model, (path) => {
    required(path.name);
    required(path.firstname);
    required(path.job);
    required(path.cin);
    pattern(path.cin, /^[0-9]{8}$/);
    required(path.age);
  });

  addCv() {
    const { name, firstname, path, job, cin, age } = this.model();
    const cv = new Cv(0, firstname, name, job, path, cin, age);
    this.cvService.addCv(cv).subscribe({
      next: (cv) => {
        this.router.navigate([APP_ROUTES.cv]);
        this.toastr.success(`Le cv ${cv.firstname} ${cv.name}`);
      },
      error: () => {
        this.toastr.error(`Une erreur s'est produite, Veuillez contacter l'admin`);
      },
    });
  }
}
