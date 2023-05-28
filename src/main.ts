import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { RouteReuseStrategy, RouterModule, provideRouter } from '@angular/router';
import { enableProdMode, importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { firebaseConfig } from './app.config';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { routes } from './app/app.routes';

if (environment.production) {
  enableProdMode();
}

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const db = getFirestore(firebaseApp);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot({})),
    importProvidersFrom(HttpClientModule),
    provideRouter(routes),
  ],
});
