import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { fetchReceiptData } from "@/lib/receiptApi";

export const Route = createFileRoute("/receipt/$id")({
  component: ReceiptPage,
});

interface ReceiptPayload {
  payment_id: string;
  amount: number;
  payment_type: string;
  notes: string | null;
  created_at: string;
  client_id: string;
  client_full_name: string;
  payment_proof_url: string | null;
}

function ReceiptPage() {
  const { id } = useParams({ from: "/receipt/$id" });
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { session } = useAuth();

  const loadReceiptData = async (receiptId: string) => {
    if (!session?.access_token) {
      throw new Error('Necesitas iniciar sesión para ver este comprobante.');
    }

    try {
      const res = await fetchReceiptData({
        data: { paymentId: receiptId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      console.debug("Server function response for fetchReceiptData:", res);

      return {
        payment_id: res.payment.id,
        amount: Number(res.payment.amount),
        payment_type: res.payment.payment_type,
        notes: res.payment.notes,
        created_at: res.payment.created_at,
        client_id: res.payment.client_id,
        client_full_name: res.client.full_name,
        payment_proof_url: res.client.payment_proof_url,
      } as ReceiptPayload;
    } catch (err) {
      console.error("Exception calling fetchReceiptData:", err);
      throw err;
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("ID de comprobante inválido.");
        setLoading(false);
        return;
      }

      try {
        const typedData = await loadReceiptData(id);
        setReceipt(typedData);
      } catch (fetchError: unknown) {
        console.error("Error cargando comprobante:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar el comprobante.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background px-4 text-muted-foreground">Cargando comprobante...</div>;
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-xl p-6">
          <Card className="p-6">
            <h1 className="text-xl font-semibold mb-3">Comprobante no disponible</h1>
            <p className="text-sm text-muted-foreground">{error ?? "No se encontró el comprobante solicitado."}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Comprobante de pago</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Detalle del pago</h1>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-semibold text-lg">{receipt.client_full_name}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Monto</p>
              <p className="font-semibold text-xl">{fmt(receipt.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de pago</p>
              <p className="font-semibold capitalize text-xl">{receipt.payment_type}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-semibold">{new Date(receipt.created_at).toLocaleDateString("es")}</p>
          </div>

          {receipt.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="whitespace-pre-wrap text-foreground">{receipt.notes}</p>
            </div>
          )}

          {receipt.payment_proof_url ? (
            <div className="rounded-xl border border-border bg-muted p-4 text-sm">
              <p className="text-sm text-muted-foreground">Comprobante adjunto</p>
              <a
                href={receipt.payment_proof_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Ver archivo de comprobante
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground">
              No hay ningún comprobante adjunto en este momento.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.close();
                }
              }}
            >
              Cerrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
