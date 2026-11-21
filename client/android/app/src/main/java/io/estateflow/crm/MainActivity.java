package io.estateflow.crm;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (this.bridge != null) {
                WebView webView = this.bridge.getWebView();
                if (webView != null) {
                    webView.setBackgroundColor(android.graphics.Color.WHITE);
                    WebSettings settings = webView.getSettings();
                    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                    settings.setDomStorageEnabled(true);
                    settings.setJavaScriptEnabled(true);
                    settings.setAllowContentAccess(true);
                    settings.setAllowFileAccess(true);
                    settings.setDatabaseEnabled(true);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
