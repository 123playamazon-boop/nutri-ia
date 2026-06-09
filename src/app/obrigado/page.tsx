import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ObrigadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50/50 to-background px-4">
      <Card className="w-full max-w-lg glass">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Pagamento confirmado! 🎉</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Enviamos um email com seu <strong>login e senha temporária</strong> para acessar a plataforma Nutri IA.
          </p>

          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left text-sm space-y-2">
            <p className="flex items-center gap-2 font-medium text-primary">
              <Mail className="h-4 w-4" /> Próximos passos:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Abra o email (verifique spam)</li>
              <li>Entre com login e senha recebidos</li>
              <li>Altere sua senha em Configurações</li>
              <li>Complete a consulta com a Nutricionista IA</li>
            </ol>
          </div>

          <Link href="/login?welcome=1" className="block mt-6">
            <Button size="lg" className="w-full">
              Ir para o login
            </Button>
          </Link>

          <p className="mt-4 text-xs text-muted-foreground">
            Não recebeu o email? Entre em contato com o suporte informando o email usado na compra.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
