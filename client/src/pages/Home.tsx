import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut, MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: items, isLoading: itemsLoading } = trpc.items.list.useQuery();

  const handleLogout = async () => {
    await logout?.();
  };

  const handleProductClick = (itemId: number, sellerId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    setLocation(`/chat?itemId=${itemId}&sellerId=${sellerId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ShoppingBag className="text-primary-foreground" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Stitch</h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="sm"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-secondary to-background py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              探索優雅的二手商品
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              發現精心挑選的二手商品，與賣家直接溝通，享受優質的交易體驗。
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container">
          <h3 className="text-2xl font-bold text-foreground mb-8">最新商品</h3>

          {itemsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">目前沒有商品可供顯示</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onViewDetails={() => handleProductClick(item.id, item.sellerId)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface ProductCardProps {
  item: any;
  onViewDetails: () => void;
}

function ProductCard({ item, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Image Container */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {!imageError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <ShoppingBag className="text-muted-foreground" size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h4>

        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            NT${Number(item.price).toFixed(0)}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <MessageCircle size={16} />
            聊天
          </Button>
        </div>

        {item.status && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              item.status === 'available' ? 'bg-green-100 text-green-700' :
              item.status === 'sold' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {item.status === 'available' ? '可購買' : item.status === 'sold' ? '已售出' : '待確認'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
