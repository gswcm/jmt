//-- Root assets
import "./assets/favicon.ico";
import "./assets/robots.txt";
import "./assets/sitemap.xml";
import "./assets/about.css";
import "./assets/email.css";
import "./assets/logo_email.png";
//-- Dependences
import vue from "vue";
import vueRouter from "vue-router";
import vueNoty from "vuejs-noty";
import axios from "axios";
import vueAxios from "vue-axios";
import bootstrapVue from "bootstrap-vue";
import store from "./store";
import root from "./components/root.vue";
import "open-iconic/font/css/open-iconic-bootstrap.css";
import "bootstrap/dist/css/bootstrap.css";
// import 'bootswatch/dist/united/bootstrap.css';
import "bootstrap-vue/dist/bootstrap-vue.css";
import "vuejs-noty/dist/vuejs-noty.css";

const router = new vueRouter({
	routes: [
		{
			path: "/",
			component: () =>
				import(/* webpackChunkName: "landing" */ "./components/landing.vue")
		},
		{
			path: "/start",
			component: () =>
				import(/* webpackChunkName: "start" */ "./components/start.vue")
		},
		{
			path: "*",
			component: () =>
				import(/* webpackChunkName: "404" */ "./components/404.vue")
		}
	],
	mode: "history"
});
vue.use(bootstrapVue);
vue.use(vueRouter);
vue.use(vueAxios, axios);
vue.use(vueNoty, {
	killer: true,
	theme: "metroui",
	timeout: 4000,
	progressBar: false,
	layout: "topRight"
});

new (vue.extend(root))({ store, router }).$mount("#app");
