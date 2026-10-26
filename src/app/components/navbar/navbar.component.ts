import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { ToastrService } from '@relynn/ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate([APP_ROUTES.login]);
    this.toastr.warning(`Au plaisir de vous revoir :(`);
  }
}
