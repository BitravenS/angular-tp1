import { NgModule } from "@angular/core";
import { RouterModule, Route } from "@angular/router";
import { TodoComponent } from "./todo/todo/todo.component";
import { MiniWordComponent } from "./directives/mini-word/mini-word.component";
import { ColorComponent } from "./components/color/color.component";
import { FrontComponent } from "./templates/front/front.component";
import { AdminComponent } from "./templates/admin/admin.component";
import { LoginComponent } from "./auth/login/login.component";
import { NF404Component } from "./components/nf404/nf404.component";
import { AuthGuard } from "./auth/guards/auth.guard";
import { RhComponent } from "./optimizationPattern/rh/rh.component";

const routes: Route[] = [
  { path: "login", component: LoginComponent },
  { path: "rh", component: RhComponent },
  { path: "ttc", loadComponent: () => import("./ttc/ttc.component").then((m) => m.TtcComponent) },
  {
    path: "cv",
    loadComponent: () => import("./cv/cv/cv.component").then((m) => m.CvComponent),
  },
  {
    path: "cv/add",
    loadComponent: () => import("./cv/add-cv/add-cv.component").then((m) => m.AddCvComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "cv/:id",
    loadComponent: () => import("./cv/details-cv/details-cv.component").then((m) => m.DetailsCvComponent),
  },
  {
    path: "",
    component: FrontComponent,
    children: [
      { path: "todo", component: TodoComponent },
      { path: "word", component: MiniWordComponent },
    ],
  },
  {
    path: "admin",
    component: AdminComponent,
    children: [{ path: "color", component: ColorComponent }],
  },
  { path: "**", component: NF404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
