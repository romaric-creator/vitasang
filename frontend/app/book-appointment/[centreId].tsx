import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { useNotification } from "@/context/NotificationContext";
import { Formik } from "formik";
import * as Yup from "yup";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getCentreDetails, createAppointment } from "@/services/user.service";
import { analyticsService } from "@/services/analyticsService";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

const BookingSchema = Yup.object().shape({
  date: Yup.string().required("La date est requise"),
  time: Yup.string().required("L'heure est requise"),
});

export default function BookAppointmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { show } = useNotification();
  const params = useLocalSearchParams();
  const centreId = Number(params.centreId);

  const [centre, setCentre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États séparés pour les sélecteurs
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadCentre = async () => {
      if (!centreId) return;
      setLoading(true);
      try {
        const res = await getCentreDetails(centreId);
        if (res.success) {
          setCentre(res.centre);
        } else {
          show("error", t("booking.loadError"));
        }
      } catch (error) {
        show("error", t("booking.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadCentre();
  }, [centreId]);

  const handleBooking = async (values: { date: string; time: string }) => {
    setIsSubmitting(true);
    try {
      const appointmentData = {
        id_centre: centreId,
        date_rdv: values.date,
        heure_debut: values.time,
      };
      
      const res = await createAppointment(appointmentData);
      
      if (res.success) {
        analyticsService.trackEvent(analyticsService.events.APPOINTMENT_BOOKED, {
          centreId: centreId,
          centreName: centre.nom_centre,
        });
        show("success", t("booking.success"));
        router.replace("/rendezvous");
      } else {
        show("error", t("booking.submitError"));
      }

    } catch (error) {
      show("error", t("booking.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible={true} message={t("common.loading")} />;
  }

  if (!centre) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.notFoundText}>{t("booking.notFound")}</Text>
        <PrimaryButton title={t("common.actions.backHome")} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("booking.title")} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Info Centre */}
        <View style={styles.centreCard}>
          <View style={styles.iconBox}>
            <TabBarIcon name="hospital-o" size={32} color={color.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.centreName}>{centre.nom_centre}</Text>
            <Text style={styles.centreAddress}>{centre.adresse}</Text>
            {centre.telephone && (
              <Text style={styles.centrePhone}>{centre.telephone}</Text>
            )}
          </View>
        </View>

        <Formik
          initialValues={{ date: "", time: "" }}
          validationSchema={BookingSchema}
          onSubmit={handleBooking}
        >
          {({ values, errors, touched, handleSubmit, setFieldValue }) => (
            <View style={styles.form}>
              
              {/* Date Picker */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <FormField
                    label={t("booking.dateLabel")}
                    value={values.date}
                    placeholder={t("booking.datePlaceholder")}
                    error={errors.date}
                    touched={touched.date}
                    editable={false} 
                    icon="calendar"
                  />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={values.date ? new Date(values.date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until confirmed
                    if (date) {
                      setFieldValue("date", date.toISOString().split('T')[0]);
                      if (Platform.OS !== 'ios') setShowDatePicker(false);
                    } else {
                      setShowDatePicker(false);
                    }
                  }}
                />
              )}
              
              {/* iOS Done Button for Date */}
              {Platform.OS === 'ios' && showDatePicker && (
                <View style={styles.iosPickerToolbar}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.iosDoneText}>{t("common.actions.yes")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Time Picker */}
              <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <FormField
                    label={t("booking.timeLabel")}
                    value={values.time}
                    placeholder={t("booking.timePlaceholder")}
                    error={errors.time}
                    touched={touched.time}
                    editable={false}
                    icon="clock-o"
                  />
                </View>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  is24Hour={true}
                  onChange={(event, date) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (date) {
                      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                      setFieldValue("time", timeString);
                      if (Platform.OS !== 'ios') setShowTimePicker(false);
                    } else {
                      setShowTimePicker(false);
                    }
                  }}
                />
              )}

              {/* iOS Done Button for Time */}
              {Platform.OS === 'ios' && showTimePicker && (
                <View style={styles.iosPickerToolbar}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.iosDoneText}>{t("common.actions.yes")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <PrimaryButton
                title={t("booking.submit")}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={{ marginTop: 30 }}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.screenBackground,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    fontSize: 16, 
    color: color.textSecondary,
    marginBottom: 20,
  },
  centreCard: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    margin: 16,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: "center",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#EFF6FF", // blue-50
    justifyContent: "center",
    alignItems: "center",
  },
  centreName: {
    fontSize: 18,
    fontWeight: "800",
    color: color.textMain,
    marginBottom: 4,
  },
  centreAddress: {
    fontSize: 13,
    color: color.textSecondary,
    marginBottom: 2,
  },
  centrePhone: {
    fontSize: 13,
    color: color.primary,
    fontWeight: "600",
  },
  form: {
    paddingHorizontal: 20,
    gap: 10,
  },
  iosPickerToolbar: {
    backgroundColor: "#F2F2F2", 
    padding: 10, 
    alignItems: "flex-end",
    marginBottom: 10,
    borderRadius: 8,
  },
  iosDoneText: {
    color: color.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
