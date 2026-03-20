import { useState, useEffect } from "react";
import { Calendar, User, Clock, Check, X, Phone, FileText } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Appointment } from "../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.centre?.id_centre) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/centres/${user.centre.id_centre}/appointments`,
        );

        if (response.data.success && response.data.rendezvous) {
          setAppointments(response.data.rendezvous);
        }
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError("Erreur lors de la récupération des rendez-vous");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleValidateAppointment = async (appointmentId: number) => {
    try {
      const response = await api.put(`/rendezvous/${appointmentId}`, {
        statut_rdv: "valide",
      });

      if (response.data.success) {
        setAppointments((prevState) =>
          prevState.map((apt) =>
            apt.id_rdv === appointmentId
              ? { ...apt, statut_rdv: "valide" }
              : apt,
          ),
        );
      }
    } catch (err) {
      console.error("Error validating appointment:", err);
      setError("Erreur lors de la validation du rendez-vous");
    }
  };

  const handleRejectAppointment = async (appointmentId: number) => {
    try {
      const response = await api.put(`/rendezvous/${appointmentId}`, {
        statut_rdv: "annule",
      });

      if (response.data.success) {
        setAppointments((prevState) =>
          prevState.map((apt) =>
            apt.id_rdv === appointmentId
              ? { ...apt, statut_rdv: "annule" }
              : apt,
          ),
        );
      }
    } catch (err) {
      console.error("Error rejecting appointment:", err);
      setError("Erreur lors du rejet du rendez-vous");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "upcoming") {
      return apt.statut_rdv !== "absent" && apt.statut_rdv !== "annule";
    } else {
      return apt.statut_rdv === "absent" || apt.statut_rdv === "annule";
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valide":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-700 dark:text-green-400",
          label: "Validé",
        };
      case "planifie":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400",
          label: "Planifié",
        };
      case "absent":
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-700 dark:text-gray-400",
          label: "Absent",
        };
      case "annule":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          label: "Annulé",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-700 dark:text-gray-400",
          label: status,
        };
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: "40px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--text-main)",
          }}
        >
          Rendez-vous
        </h1>
        <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)" }}>
          Gestion des donneurs planifiés
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#ef4444",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setActiveTab("upcoming")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 15px",
            fontSize: "1rem",
            fontWeight: activeTab === "upcoming" ? 600 : 500,
            color:
              activeTab === "upcoming" ? "var(--primary)" : "var(--text-muted)",
            borderBottom:
              activeTab === "upcoming"
                ? "2px solid var(--primary)"
                : "2px solid transparent",
            cursor: "pointer",
            transition: "var(--transition)",
          }}
        >
          À venir (
          {
            filteredAppointments.filter(
              (a) => a.statut_rdv !== "absent" && a.statut_rdv !== "annule",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            background: "none",
            border: "none",
            padding: "10px 15px",
            fontSize: "1rem",
            fontWeight: activeTab === "history" ? 600 : 500,
            color:
              activeTab === "history" ? "var(--primary)" : "var(--text-muted)",
            borderBottom:
              activeTab === "history"
                ? "2px solid var(--primary)"
                : "2px solid transparent",
            cursor: "pointer",
            transition: "var(--transition)",
          }}
        >
          Historique (
          {
            filteredAppointments.filter(
              (a) => a.statut_rdv === "absent" || a.statut_rdv === "annule",
            ).length
          }
          )
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Chargement des rendez-vous...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAppointments.length === 0 && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          {activeTab === "upcoming"
            ? "Aucun rendez-vous prévu"
            : "Aucun rendez-vous dans l'historique"}
        </div>
      )}

      {/* Appointments List */}
      {!loading && filteredAppointments.length > 0 && (
        <div style={{ display: "grid", gap: "15px" }}>
          {filteredAppointments.map((apt) => {
            const statusColor = getStatusColor(apt.statut_rdv);
            const appointmentDate = new Date(apt.date_heure_rdv);
            const formattedDate = format(appointmentDate, "dd MMM yyyy", {
              locale: fr,
            });
            const formattedTime = format(appointmentDate, "HH:mm");

            return (
              <div
                key={apt.id_rdv}
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  {/* Donor Avatar */}
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "var(--background)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    <User size={24} />
                  </div>

                  {/* Donor Info */}
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: "1.1rem" }}>
                      {apt.donneur?.nom} {apt.donneur?.prenom}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Calendar size={14} /> {formattedDate}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Clock size={14} /> {formattedTime}
                      </span>
                      {apt.typeDon && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          💉 {apt.typeDon.nom_type_don}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: "8px",
                      borderRadius: "50%",
                      color: "var(--text-muted)",
                    }}
                    title="Appeler"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: "8px",
                      borderRadius: "50%",
                      color: "var(--text-muted)",
                    }}
                    title="Dossier"
                  >
                    <FileText size={18} />
                  </button>

                  {/* Status Badge */}
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                    }}
                  >
                    {statusColor.label}
                  </span>

                  {/* Upcoming Actions */}
                  {activeTab === "upcoming" &&
                    apt.statut_rdv === "planifie" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginLeft: "10px",
                          borderLeft: "1px solid var(--border)",
                          paddingLeft: "20px",
                        }}
                      >
                        <button
                          className="btn"
                          style={{
                            background: "rgba(230, 57, 70, 0.1)",
                            color: "var(--danger)",
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                          onClick={() => handleRejectAppointment(apt.id_rdv)}
                        >
                          <X size={16} /> Refuser
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                            background: "var(--success)",
                          }}
                          onClick={() => handleValidateAppointment(apt.id_rdv)}
                        >
                          <Check size={16} /> Valider
                        </button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Appointments;
