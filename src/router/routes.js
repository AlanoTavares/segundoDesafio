const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"), // Página inicial
      },
      {
        path: "responder",
        component: () => import("pages/QuizResponder.vue"), // Página de responder o quiz
      },
    ],
  },

  // Rota de erro padrão
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
