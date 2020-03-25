
from django.contrib import admin
from django.urls import include, path
from django.conf.urls import url
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from api import views
from django.utils.translation import gettext_lazy as _

admin.site.site_header = _("GeoShop Administration")
admin.site.site_title = _("GeoShop Admin")

router = routers.DefaultRouter()
router.APIRootView = views.APIRootView
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'copyright', views.CopyrightViewSet)
router.register(r'document', views.DocumentViewSet) 
router.register(r'format', views.FormatViewSet)
router.register(r'identity', views.IdentityViewSet)
router.register(r'metadata', views.MetadataViewSet)
router.register(r'order', views.OrderViewSet)
router.register(r'orderitem', views.OrderItemViewSet)
router.register(r'ordertype', views.OrderTypeViewSet)
router.register(r'pricing', views.PricingViewSet)
router.register(r'product', views.ProductViewSet)
router.register(r'productformat', views.ProductFormatViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('admin/', admin.site.urls, name='admin'),
    path('', include(router.urls)),
]
