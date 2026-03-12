import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './services/auth.service';
import { jwtDecode } from 'jwt-decode'; // Necesitamos decodificar el token para ver el rol

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule, RouterOutlet, 
    MatIconModule, MatButtonModule, MatSidenavModule, 
    MatToolbarModule, MatListModule, MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  title = 'Odisssey AutoTech';
  username: string = '';
  userRole: string = '';

  ngOnInit() {
    this.extractUserData();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  extractUserData() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.username = decoded.username;
        this.userRole = decoded.rol;
      } catch (error) {
        console.error("Error decodificando token", error);
      }
    }
  }

  logout() {
    this.authService.logout();
    this.username = '';
    this.userRole = '';
    this.router.navigate(['/login']);
  }
}

