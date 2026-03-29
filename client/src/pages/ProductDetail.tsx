import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { getLoginUrl } from "@/const";

export default function ProductDetail() {
  const [, setLocation] = useLocation();
  const [isMatch, params] = useRoute("/items/:id");
  const itemId = params?.id ? parseInt(params.id) : 0;

  const { user } = useAuth();
  const { data: item, isLoading, error } = trpc.items.getById.useQuery(
    { id: itemId },
    { enabled: !!itemId }
  );

  const handleStartChat = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (item && item.sellerId !== user.id) {
      setLocation(`/chat?itemId=${item.id}&sellerId=${item.sellerId}`);
    }
  };

  if (!isMatch) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">商品未找到</h1>
          <p className="text-muted-foreground mb-8">抱歉，我們找不到您要查看的商品。</p>
          <Button onClick={() => setLocation("/")} variant="default">
            返回首頁
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProduct = user && item.sellerId === user.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft size={20} />
            返回
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="flex items-center justify-center bg-card rounded-lg overflow-hidden border border-border">
              <img
                src={item.imageUrl || ""}
                alt={item.title || ""}
              className="w-full h-full object-cover max-h-96"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='24'%3EImage not available%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              {item.status !== "available" && (
                <div className="mb-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {item.status === "sold" ? "已售出" : "待確認"}
                </div>
              )}

              <h1 className="text-3xl font-bold text-foreground mb-4">{item.title}</h1>

              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">價格</p>
                <p className="text-3xl font-bold text-primary">
                  ${Number(item.price || 0).toFixed(2)}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">商品描述</h2>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">商品狀態</h2>
                <p className="text-muted-foreground">
                  {item.status === "available"
                    ? "可購買"
                    : item.status === "sold"
                      ? "已售出"
                      : "待確認"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isOwnProduct ? (
                <div className="text-center text-muted-foreground py-4 px-4 bg-muted rounded-lg w-full">
                  這是您的商品
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleStartChat}
                    disabled={item.status !== "available"}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <MessageCircle size={20} />
                    {user ? "聯絡賣家" : "登入後聯絡"}
                  </Button>
                  {item.status !== "available" && (
                    <p className="text-sm text-muted-foreground mt-2">此商品暫不可購買</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
