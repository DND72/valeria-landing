import type { Router } from 'express'
import type { Pool } from 'pg'

export function registerStaffAnalyticsRoutes(r: Router, pool: Pool): void {
  /**
   * GET /api/staff/analytics
   * Calcola KPI per la dashboard staff:
   * - Sessioni per mese corrente e precedente
   * - Distribuzione per tipo (tarocchi / coaching / combo)
   * - Clienti nuovi vs di ritorno
   */
  r.get('/analytics', async (_req, res) => {
    try {
      // === 1. Sessioni mensili (ultime 6 mensilità) ===
      const monthlyRows = await pool.query<{
        month: string
        total: string
        paid: string
        free: string
      }>(
        `SELECT
           TO_CHAR(DATE_TRUNC('month', start_at AT TIME ZONE 'Europe/Rome'), 'YYYY-MM') AS month,
           COUNT(*)::text        AS total,
           SUM(CASE WHEN NOT is_free_consult THEN 1 ELSE 0 END)::text AS paid,
           SUM(CASE WHEN is_free_consult THEN 1 ELSE 0 END)::text     AS free
         FROM consults
         WHERE status <> 'cancelled'
           AND start_at IS NOT NULL
           AND start_at >= NOW() - INTERVAL '6 months'
         GROUP BY 1
         ORDER BY 1 ASC`
      )

      // === 2. Distribuzione per tipo (basata su calendly_event_name) ===
      const typeRows = await pool.query<{ kind: string; n: string }>(
        `SELECT
           CASE
             WHEN LOWER(calendly_event_name) ILIKE '%combo full%'   THEN 'combo_full'
             WHEN LOWER(calendly_event_name) ILIKE '%combo light%'  THEN 'combo_light'
             WHEN LOWER(calendly_event_name) ILIKE '%coaching%'     THEN 'coaching'
             WHEN LOWER(calendly_event_name) ILIKE '%tarocch%'      THEN 'tarocchi'
             ELSE 'altro'
           END AS kind,
           COUNT(*)::text AS n
         FROM consults
         WHERE status <> 'cancelled'
           AND start_at IS NOT NULL
           AND start_at >= NOW() - INTERVAL '12 months'
         GROUP BY 1
         ORDER BY 2 DESC`
      )

      // === 3. Clienti nuovi vs di ritorno (nel mese corrente) ===
      // "Nuovo" = prima prenotazione assoluta su quell'email cade nel mese corrente
      const retentionRows = await pool.query<{ is_new: boolean; n: string }>(
        `WITH first_per_email AS (
           SELECT
             LOWER(TRIM(invitee_email)) AS email,
             MIN(start_at) AS first_at
           FROM consults
           WHERE invitee_email IS NOT NULL AND TRIM(invitee_email) <> '' AND status <> 'cancelled'
           GROUP BY 1
         )
         SELECT
           (DATE_TRUNC('month', first_at AT TIME ZONE 'Europe/Rome') = DATE_TRUNC('month', NOW() AT TIME ZONE 'Europe/Rome')) AS is_new,
           COUNT(*)::text AS n
         FROM first_per_email
         GROUP BY 1`
      )

      // === 4. Totale distinto clienti ===
      const totalClientsRow = await pool.query<{ n: string }>(
        `SELECT COUNT(DISTINCT LOWER(TRIM(invitee_email)))::text AS n
         FROM consults
         WHERE invitee_email IS NOT NULL AND TRIM(invitee_email) <> '' AND status <> 'cancelled'`
      )

      const newClients = Number(retentionRows.rows.find((r) => r.is_new)?.n ?? 0)
      const returningClients = Number(retentionRows.rows.find((r) => !r.is_new)?.n ?? 0)

      res.json({
        monthly: monthlyRows.rows.map((r) => ({
          month: r.month,
          total: Number(r.total),
          paid: Number(r.paid),
          free: Number(r.free),
        })),
        typeDistribution: Object.fromEntries(
          typeRows.rows.map((r) => [r.kind, Number(r.n)])
        ),
        retention: {
          newThisMonth: newClients,
          returningTotal: returningClients,
          totalDistinctClients: Number(totalClientsRow.rows[0]?.n ?? 0),
        },
      })
    } catch (e) {
      console.error('[staff analytics]', e)
      res.status(500).json({ error: 'Errore database' })
    }
  })
}
