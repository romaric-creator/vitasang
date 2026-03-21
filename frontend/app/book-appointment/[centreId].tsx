import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const loadCentre = async () => {
      if (!centreId) return;
      setLoading(true);
      try {
        // This will be replaced with a real service call
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
        // In a real app, you'd add more fields like donation type
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
    return (
      <View style={styles.centerContent}>
        <LoadingOverlay visible={true} message={t("common.loading")} />
      </View>
    );
  }

  if (!centre) {
    return (
      <View style={styles.centerContent}>
        <Text>{t("booking.notFound")}</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("booking.title")} />
      <ScrollView>
        <View style={styles.centreInfo}>
          <TabBarIcon name="hospital-o" size={24} color={color.primary} />
          <View>
            <Text style={styles.centreName}>{centre.nom_centre}</Text>
            <Text style={styles.centreAddress}>{centre.adresse}</Text>
          </View>
        </View>

        <Formik
          initialValues={{ date: "", time: "" }}
          validationSchema={BookingSchema}
          onSubmit={handleBooking}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => (
            <View style={styles.form}>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <FormField
                    label={t("booking.dateLabel")}
                    value={values.date}
                    placeholder={t("booking.datePlaceholder")}
                    error={errors.date}
                    touched={touched.date}
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
                    setShowDatePicker(false);
                    if (date) {
                      handleChange("date")(date.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}

              <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                <View pointerEvents="none">
                  <FormField
                    label={t("booking.timeLabel")}
                    value={values.time}
                    placeholder={t("booking.timePlaceholder")}
                    error={errors.time}
                    touched={touched.time}
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
                    setShowTimePicker(false);
                    if (date) {
                      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      handleChange("time")(time);
                    }
                  }}
                />
              )}
              <PrimaryButton
                title={t("booking.submit")}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={{ marginTop: 20 }}
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
  },
  centreInfo: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    margin: 16,
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  centreName: {
    fontSize: 16,
    fontWeight: "700",
    color: color.textMain,
  },
  centreAddress: {
    fontSize: 13,
    color: color.textSecondary,
  },
  form: {
    paddingHorizontal: 16,
  },
});
